/* =============================================================================
 * EECE/CS 3093C Software Engineering — Lab 4
 * USCities Search — client.js
 * ============================================================================= */

var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', () =>{
  performSearch();
  searchInput.value = ''; // clear field input box after perform search
});

searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    performSearch();
    searchInput.value = '';
  }
});

const BASE_URL = "https://ongjs-uscitties-microservices-f9awfuekdsg6dah6.canadacentral-01.azurewebsites.net/";
async function performSearch() {

  var rawQuery = searchInput.value.trim();
  var safeQuery = encodeHTML(rawQuery).trim();

  if (!safeQuery) { // AC9: Empty/Whitespace only queries never reach fetch()
    searchInput.focus();
    return;
  }

  console.log('Debug>query: ' + safeQuery); // UI Testing


  try {
    const response = await fetch(`${BASE_URL}/uscities-search/${encodeURIComponent(rawQuery)}`) // search request, must remain rawQuery

    // Server returned HTTP Error: 404 or 500
    if (!response.ok) {
      throw new Error(`Unexpected Status: Server returned ${response.status}`); // AC4 & AC11: Fail Safely, Not open
    }

    // Read response body and convert JSON text into JS value
    const data = await response.json();

    // If doesnt return an array of city result -> Error
    if (!Array.isArray(data)) {
      throw new Error('Malformed Response'); // AC10: Validate Shape before Display
    }
    displaySearch(data);

  } catch (err) {
    console.log(`Debug>Search Error: ${err.message}`);
    responses.textContent = 'Error: Couldnt Load Results'; // AC4 & AC11
  }
}

var responseElm = document.getElementById('responses');
function displaySearch() {
  if (!responsesElm) {
    console.log('Error: Unable to get "responses".');
    return;
  }

  // AC1 & AC2: Matches Found - This version only shows raw JSON text
  // AC3: No Macthes - Explicit Message instead of a blank/empty display
  // textContent for now

  // condition ? valueIfTrue : valueIfFalse
  // condition: if data.length == 0
  // valueIfTrue: Display 'No Cities Found'
  // valueIfFalse: Convert 'data' into formatted JSON and display
  responsesElm.textContent = data.length == 0 ? 'No Cities Found' : JSON.stringify(data, null, 2) 
}

function encodeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Test w/ `python -m http.server 8080`
