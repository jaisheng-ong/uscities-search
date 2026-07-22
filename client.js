/* =============================================================================
 * EECE/CS 3093C Software Engineering — Lab 4
 * USCities Search — client.js
 * ============================================================================= */

var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', () =>{
  performSearch();
  searchInput.value = '';
});

searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    performSearch();
    searchInput.value = '';
  }
});

function performSearch() {

  var rawValue = searchInput.value.trim();
  var safeValue = encodeHTML(rawValue).trim();

  if (!safeValue) {
    searchInput.focus();
    return;
  }
  console.log('Debug>query: ' + safeValue);
}

function encodeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
