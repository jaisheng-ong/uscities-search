/* =============================================================================
 * EECE/CS 3093C Software Engineering — Lab 4
 * USCities Search — client.js
 * ============================================================================= */

// Test w/ `python -m http.server 8080`

var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', () =>{
  performSearch();
  searchInput.value = ''; // clear field input box after perform search
});

// Instant Ajax Timer -  At LEAST 2 CHARACTERS BEFORE SUGGESTING and debounce ~300 ms after last keystroke
var debounceTimer = null;
searchInput.addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
    clearTimeout(debounceTimer);
    performSearch(); // perform search only 'Search' button is clicked
    searchInput.value = '';
    return;
  }
  clearTimeout(debounceTimer);
  var rawQuery = searchInput.value.trim();
  if (rawQuery < 2) { // AC5: At least 2 chars before suggesting
    return;
  }
  debounceTimer = setTimeout(performSearch, 300) // AC07: debouce ~300ms after last keystroke

});

const BASE_URL_AZURE = "https://ongjs-uscitties-microservices-f9awfuekdsg6dah6.canadacentral-01.azurewebsites.net/";
const BASE_URL_RENDER = "https://uscitties-microservices.onrender.com/"

async function performSearch() {

  var rawQuery = searchInput.value.trim();
  var safeQuery = encodeHTML(rawQuery).trim();

  if (!safeQuery) { // AC9: Empty/Whitespace only queries never reach fetch()
    searchInput.focus();
    return;
  }

  console.log('Debug>query: ' + safeQuery); // UI Testing


  try {
    const response = await fetch(`${BASE_URL_AZURE}uscities-search/${encodeURIComponent(rawQuery)}`) // search request, must remain rawQuery

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
    
    if (responseElm) {
      responseElm.textContent = 'Error: Couldnt Load Results'; // AC4 & AC11
    }

  }
}

var responseElm = document.getElementById('responses');
function displaySearch(data) {
  if (!responseElm) {
    console.log('Error: Unable to get "responses".');
    return;
  }
  // AC1 & AC2: Matches Found — render as HTML table
  // AC3: No Matches — explicit message instead of blank display
  responseElm.innerHTML = json2htmltable(data);
}
// AC9/AC10: sanitize every field before it is rendered as HTML
function data_sanitize(v) {

  // if input is string run through DOMPurify
  return DOMPurify.sanitize(typeof v === 'string' ? v : '');
}

function json2htmltable(data) {

  // check if input is non-empty Array.
  if (!Array.isArray(data) || data.length === 0) {
    return "No cities found"; // AC10/AC11
  }


  var rows = data.map(function (c) {
      return "<tr><td>" + data_sanitize(c.city) + "</td><td>" + data_sanitize(c.state_name) +
          "</td><td>" + data_sanitize(c.zips) + "</td></tr>";
  }).join('');

  return "<table><tr><th>City</th><th>State</th><th>Zips</th></tr>" + rows + "</table>";
}

function encodeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}