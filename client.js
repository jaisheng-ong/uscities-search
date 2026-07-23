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
    const response = await fetch(`${BASE_URL_RENDER}/uscities-search/${encodeURIComponent(rawQuery)}`) // search request, must remain rawQuery

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
    if (responseElm) { // AC4 & AC11
      responseElm.textContent = 'Error: Couldnt Load Results';
    }
  }
}

var responseElm = document.getElementById('responses');

function displaySearch(data) {
  if (!responseElm) {
    console.log('Error: Unable to get "responses".');
    return;
  }

  responseElm.innerHTML = '';

  if (data.length === 0) {
    responseElm.textContent = 'No Cities Found';
    return;
  }

  data.forEach(function (city) {
    var cityBlock = document.createElement('div');
    cityBlock.className = 'city-result border rounded p-3 mb-3 bg-light';

    for (var key in city) {
      if (!Object.prototype.hasOwnProperty.call(city, key)) {
        continue;
      }

      var line = document.createElement('div');
      line.textContent = key + ': ' + city[key];
      cityBlock.appendChild(line);
    }

    responseElm.appendChild(cityBlock);
  });
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
