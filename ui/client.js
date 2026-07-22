/* =============================================================================
 * EECE/CS 3093C Software Engineering — Lab 4
 * USCities Search — client.js
 * ============================================================================= */

var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');
var debugOutput = document.getElementById('debugOutput');

$('#searchBtn').on('click', performSearch);

searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    performSearch();
  }
});

function performSearch() {
  var rawValue = searchInput.value.trim();
  var safeValue = DOMPurify.sanitize(rawValue).trim();

  if (!safeValue) {
    printDebug('Error: Search Input is empty.');
    searchInput.focus();
    return;
  }

  console.log('Debug>query: ' + safeValue);

  printDebug([
    'Search triggered.',
    'Input value: ' + safeValue,
    'Input length: ' + safeValue.length,
    'Timestamp: ' + new Date().toLocaleString()
  ].join('\n'));
}

function printDebug(message) {
  debugOutput.textContent = message;
}
