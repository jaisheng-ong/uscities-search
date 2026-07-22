/* =============================================================================
 * EECE/CS 3093C Software Engineering — Lab 4
 * client.js — code skeleton provided by Dr. Phu Phung
 * Code complete implementation by Ong Jai Sheng
 * ===============================================================================
 */
var socket = io(); //connect to the Socket.io Server

/*
==============================
Client Receive from SERVER
==============================
*/
// let server know whenever to broadcast one of these events, w/ functions to use to call with the data
socket.on('status', displayStatus);
socket.on('receive-msg', displayMessage); // AC-01.2: Update instantly in real-time for all users via Socket.io without needing to refresh
socket.on('read-update' , DisplayReadMessage); // AC-01.5: Show who read msgs


// Typing Indicators for Publc/Private Chat
socket.on('typing', displayTypingIndicator)
socket.on('stop-typing', hideTypingIndicator)

socket.on('private-typing', displayPrivateTypingIndicator);
socket.on('private-stop-typing', hidePrivateTypingIndicator);


socket.on("connect", () => { //connected to the server
  console.log(`Connected to Socket.io server: 
    ${socket.io.opts.hostname}, port: ${socket.io.opts.port}`);

});

socket.on('user-list', displayUserList);

// "Receive Private Chat": fires when the SERVER sends a private message.
socket.on('private-message', displayPrivateMessage);

// "Send Private Chat" TEMPLATE (do not run at top level — copy into a click/submit handler):
//   socket.emit('private-message', { receiver: receiverId, message: data });
// where `receiverId` = the socket id of the person you picked, `data` = the text to send.

/**
 * code blocks below have been implemented in Lecture 8
 */

// Define Variables
var sendBtnElm = document.getElementById('send-button');

if(!sendBtnElm) {
    console.log("Error in getting 'send-button' button");
}
// AC-01.2 (UI): Send button click triggers sendMessage()
sendBtnElm.addEventListener('click', sendMessage);

var chatMessageInput = document.getElementById('chat-message');
if(!chatMessageInput) {
    console.log('Error in getting "chat-message" input');
}
// AC-01.2 (UI): pressing Enter also triggers sendMessage()
chatMessageInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage();
});

var typingTimer = null; // use as timer
var privateTypingTimer = null;
// Typing Indicator
$('#chat-message').on('input', detectTyping)
$('#private-chat-message').on('input', detectPrivateTyping);


var clientUsername = ''; // variable to store self username

var usernameInput = document.getElementById('username');
var loginUI = document.getElementById('loginUI');
var chatUI = document.getElementById('chatUI');

var activeRecipientID = ''; // socketID of user private chatting with
var activeRecipientName = ''; // Username of user private chatting with

// Joint Button (w/ jQuery) 
// Note: jQuery's $('#id') is just a shortcut for document.getElementById('id')
$('#searchBtn').on('click', searchButton);

// When a user at sidebar is click -> private chat popup
$('#user-list').on('click', '.user-list-item', function() {
  var recipientID = $(this).attr('data-socket-id'); // $(this) inside the handler = the <li> that was clicked
  var recipientName = $(this).text().trim();

  openPrivateChatPopup(recipientID, recipientName);
});
$('#private-close-button').on('click', closePrivateChatPopup);

// Send Private Message on keypress
$('#private-send-button').on('click', sendPrivateMessage);

$('#private-chat-message').on('keypress', function (e) {

  if (e.key === 'Enter') {
    sendPrivateMessage();
  }
});

// LogOut Button
var logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', LogOut);


// =============================================================================
// Use-Case-01: Send Message
// =============================================================================

// AC-01.1: Function to emits to server -> server does io.emit('receive-msg',..) -> displayMessage() fcuntion that renders it for users
function sendMessage() {
    var message = chatMessageInput.value.trim();
    if (!message) {
      return;   // AC-02.2: empty messages are ignored
    }
    console.log(`Debug>Chat message: ${message}`); //for UI testing only
    
    // other ACS will be implemented
    message = DOMPurify.sanitize(message);
    socket.emit('message', message); // sends message string type to server


    chatMessageInput.value = ''; // AC-01.3: clear input after sending
    chatMessageInput.focus();

    // When message is sent hide typing indicator
    hideTypingIndicator();
}

/*
Sender -> Server

receiver = socket_id (send to who)
message = content of message
*/
function sendPrivateMessage() {

  var message = $('#private-chat-message').val().trim();

  // exit if empty message
  if (!message) {
    return; 
  }

  // exit if no one is selected in popup
  if (!activeRecipientID) {
    return;
  }

  message = DOMPurify.sanitize(message);

  // send object to server
  socket.emit('private-message', {
    receiver : activeRecipientID,
    message: message
  });

  // clear inputs
  $('#private-chat-message').val('');
  $('#private-chat-message').focus();

  // hide typing indicator
  hidePrivateTypingIndicator();
  clearTimeout(privateTypingTimer);
  socket.emit('private-stop-typing', { receiver: activeRecipientID });

}

// =============================================================================
// Use-Case-02: Receive message 
// =============================================================================

//Code to implement AC-02.1: display incoming chat messages without page refresh
function displayMessage(data) {
  var displayMsg = document.createElement('div');

  // AC-02.2 + AC-02.3: show timestamp for each message/status events
  var timestamp = new Date().toLocaleTimeString();
  displayMsg.innerHTML = '<span style="color: #2431e5">[' + timestamp + ']</span> ' + DOMPurify.sanitize(data.username) + ': ' + DOMPurify.sanitize(data.text);
  document.getElementById('responses').appendChild(displayMsg);

  // AC-01.5: Implementation on Connected Users Read Message
  displayMsg.setAttribute('data-msg-id', data.msgID);

  // Create empty 'span' placeholder and attach to message.
  var readSpan = document.createElement('span');

  readSpan.id = 'read-' + data.msgID;

  readSpan.style.cssText = 'font-size:0.75em; color:gray; margin-left:8px;';

  displayMsg.appendChild(readSpan);

  // Tell server message has been seen
  socket.emit('seen', data.msgID);
}

// AC-02.2 - display system status events (join/leave) in the status area
function displayStatus(data) {
  var statusContainer = document.getElementById('status');
  var statusElm = document.createElement('div');
  var timestamp = new Date().toLocaleTimeString();

  var action;
  if (data.action === 'joined') {
    action = 'joined';
  } else {
    action = 'left';
  }
  // AC-02.2: shows timestamp for each messages/status event
  statusElm.innerHTML = '<span style="color: #90EE90">[' + timestamp + ']</span> ' + DOMPurify.sanitize(data.username) + ' ' + action +
    ' the chat. Number of connected clients: ' + data.count;

  statusContainer.appendChild(statusElm);

  // AC-02.3 (UI): auto-scroll to the latest message
  statusContainer.scrollTop = statusContainer.scrollHeight;
}

// Show list of online users in the left sidebar
// users: {socketId: "id", username: "name"}
function displayUserList(users) {
  var lst = document.getElementById('user-list');

  // if element doesnt exist, exit.
  if (!lst) {
    return;
  }

  // clear old list
  lst.innerHTML = '';

  //loop through each user(s)
  users.forEach(function ({ socketId, username }) {

    // store the socketID on element as HTML attribute, for future getting the user(s) id in sidebar
    var li = document.createElement('li');
    var safeName = DOMPurify.sanitize(username);
    li.setAttribute('data-socket-id', socketId);

    // if self show (You) + non-clickable to avoid sending private msg to self.
    if (socketId === socket.id) {
      li.innerHTML = safeName + ' (You)';
      li.classList.add('user-list-self');

    } else { // else show name + clickable to send private msg.

      li.innerHTML = safeName;
      li.classList.add('user-list-item');

    } // result: <li class="user-list-item" data-socket-id="abc123">Bob</li>

    // append to list
    lst.appendChild(li);
  });
}

function DisplayReadMessage(data) {
  // find a specific msg's "Seen by:" area w/ ID
  var span = document.getElementById('read-' + data.msgID);

  if (!span) {
    return;
  }

  span.textContent = "Seen by: " + data.arrReaders.join(', '); // Update to show "Seen by: [names..]"
}
// =============================================================================
// TODO1: Password Validation (future)
// When a password field is added to the login form, use these regular expressions patterns:
//
//   /[0-9]/          → at least one number
//   /[a-z]/          → at least one lowercase letter
//   /[A-Z]/          → at least one uppercase letter
//   /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/
//                    → combined: min 6 chars, needs number + lowercase + uppercase
// Example Code usage:
//   var passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
//   if (!passwordRegex.test(passwordInput)) { alert("Weak password"); return; }
//
// TODO2: Loading Animation when authenticating 
// @ https://www.w3schools.com/howto/howto_css_loader.asp
//
//TODO3: ALERT MSG
// https://www.w3schools.com/w3css/w3css_alerts.asp
//
// TODO4: Public/Private Chats
// https://www.w3schools.com/howto/howto_css_chat.asp
// 
// "Send Private Chat" Use Case:
// Client sendss: socket.emit('private-message', receiver: receiverId, message: data});
// Server receives and handle: socket.on('private-message', ( {receiver, message} ) => {code to handle JSON and send to receiver});
//
// "Receive Private Chat" Use Case:
// Server sends: socket.emit('private-message', sender: senderId, message: data });
// Client receives and handles it: socket.on ('private-message', ( {sender, message} )=> {code to handle JSON and display private message});
// 
// =============================================================================

function searchButton() {

  var searchInput = document.getElementById('element')

  // checkValidity() - HTML5 validity check: respects minlength, maxlength, required
  if (!searchBox.checkValidity()) {
    alert("Error: Search Box can't be Empty.")
    searchBox.focus();
    return;
  }
  var input_entered = DOMPurify.sanitize(searchInput.value).trim();

  // if username doesnt exist
  if (!input_entered) {
    alert("Error: Please Enter A Value!");
    return;
  }

  clientSearch = input_entered;
  socket.emit('set-username', clientSearch); // send tos server

  //loginUI.style.display = 'none'; // jQuery equivalent:
  $('#loginUI').hide();
  chatUI.style.display = 'block';

  usernameInput.value = '';

  document.getElementById('chat-message').focus();

}

function LogOut() {
  var logoutBtn = document.getElementById('logoutBtn');

  clientUsername = '';

  // Hides element
  chatUI.style.display  = 'none';

  // Show element
  loginUI.style.display = 'block';

  closePrivateChatPopup();


  // Clear contents so old messages dont show when new user logs in
  document.getElementById('responses').innerHTML = '';
  document.getElementById('status').innerHTML    = '';
  document.getElementById('user-list').innerHTML = '';
  usernameInput.focus();

  hidePrivateTypingIndicator();
  
  $('#private-responses').empty();
  $('#responses').empty();
  $('#status').empty();
  $('#user-list').empty();
}
// ================
// Typing Indicator
// ================
function detectTyping() {
  //every single time user type smtg, let server know first, for broadcasting to all connected users (except sender)
  socket.emit('typing', clientUsername); 
  console.log(`Debug>${clientUsername} is typing...`); // for UI testing only

  // Avoid overlapping timers, so timer always start at 1 second.
  clearTimeout(typingTimer);

  // function to run after a 1 second delay when user stop typing, emit 'stop-typing'
  typingTimer = setTimeout(function() {
    socket.emit('stop-typing');
    console.log(`Debug>${clientUsername} stopped typing.`); // for UI testing only
  }, 1000);
};

function detectPrivateTyping() {

  // exit if no one in private chat window
  if (!activeRecipientID) {
    return;
  }

  socket.emit('private-typing', { receiver: activeRecipientID });

  clearTimeout(privateTypingTimer);

  privateTypingTimer = setTimeout(function () {
    socket.emit('private-stop-typing', { receiver: activeRecipientID });
  }, 1000);
}

// Function: displayTypingIndicator
// parameter: data: {username}
function displayTypingIndicator(data) {
  var indicator = document.getElementById('typing-indicator');
  var label = document.getElementById('typing-label');

  label.innerHTML = DOMPurify.sanitize(data.username) + ' is typing...';
  indicator.style.display = 'block';
}

function hideTypingIndicator() {

  $('#typing-indicator').hide();
  $('#typing-label').empty();
}

function openPrivateChatPopup(recipientID, recipientName) {
  activeRecipientID = recipientID;
  activeRecipientName = recipientName;

  $('#private-chat-title').text("Chat with " + DOMPurify.sanitize(recipientName));
  $('#private-chat-popup').show();
  $('#private-chat-message').focus();

}

function closePrivateChatPopup() {
  $('#private-chat-popup').hide();
  activeRecipientID = '';
  activeRecipientName = '';

  hidePrivateTypingIndicator();
  clearTimeout(privateTypingTimer);

}

function displayPrivateMessage(data) {

  // only show when private chat window is open

  if (!$('#private-chat-popup').is(':visible')) {
    return;
  }

  // ignore messages from people not chatting w/ and not self.
  if (data.sender !== activeRecipientName && data.sender !== clientUsername) {
    return;
  }

  var timestamp = new Date().toLocaleTimeString();
  var safeSender = DOMPurify.sanitize(data.sender);
  var safeMessage = DOMPurify.sanitize(data.message);

  var $msg = $('<div>').html(
    '<span style="color: #6495ED">[' + timestamp + ']</span> ' +
    safeSender + ': ' + safeMessage
  );

  $('#private-responses').append($msg);

  // auto-scroll to latest message
  var privateResponses = document.getElementById('private-responses');
  privateResponses.scrollTop = privateResponses.scrollHeight;
}

function displayPrivateTypingIndicator(data) {
  
  // show only if popup is open
  if (!$('#private-chat-popup').is(':visible')) {
    return;
  }

  // show only if the typer is the person chatting with
  if (data.username !== activeRecipientName) {
    return;
  }

  let typingUsername = DOMPurify.sanitize(data.username)

  $('#private-typing-label').text(typingUsername + ' is typing...');
  $('#private-typing-indicator').show();
}

function hidePrivateTypingIndicator() {

  $('#private-typing-indicator').hide();
  $('#private-typing-label').empty();

}
