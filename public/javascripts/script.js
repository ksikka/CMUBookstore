/********************************************
 * Def'ns:
 * 1. A textbook is an isbn, as well as the html
 * which renders it on the search result page.
 * 2. A query is a course_number, course_name,
 * and textbook_name.
 *
 * When a user types in the search fields, a
 * function gets the data from either a local
 * cache or by requesting from the server. The
 * input is a "query" and the output is a list
 * of "textbooks", where query and textbook 
 * are defined above.


/* State Variables */

var query = {};
var searchResults = [];
var buying = [];
var selling = [];

function getSearchResults(q,callback) {
  $.ajax({
    type: 'GET',
    url: '/search',
    data: q,
    success: callback,
    dataType: 'html'
  });
}

function fixSearchBindings() {
  // TODO implement
}

function renderSearchResults(result) {
  $('#search-results').html(result);
  fixSearchBindings();
}

$('document').ready(function(){

  /* Hide the ajax-loader image */
  $('#ajaxloader').hide();

  /* Hide the ajax-loader image */
  $.ajaxSetup({
    error: function(a,b,c) { console.log(a); console.log(b); console.log(c); alert('Error: See logs'); },
    beforeSend: function(){$('#ajaxloader').show()},
    complete: function(){$('#ajaxloader').hide()},
  });

  $('#search-nav form').keyup(function(){
    // TODO implement rate-limiting and local caching
    // for now, update state every single time.
    q = $('form').serialize();
    getSearchResults(q
      , renderSearchResults);
  });

  $.post("/andrew",{andrew_id:"ksikka"});

});
