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
 * of app_ids and the html to render the results,
 *
 * The search-result html has links to buy and sell,
 * which execute the buy and sell functions. Eg,
 * when the buy function is executed, the book_id
 * is added to the buy list, a put request is made to
 * the server, the search-results are modified, 
 * and the buylist ui is rendered.
 * /

/* State Variables */
var query = {};
var searchResults = [];
var buying = [];
var selling = [];

var loggedIn;

function initializeLists() {
  $.get('/user/books/buying',function(h){
    var initial_content = h.html;

    $.get('/user/books/selling',function(h){
      initial_content += h.html;
      //$('#sell-list').html(h.html);
      $('#list-all').html(initial_content);
    });
  });
}

function clearLists() {
  $('#buy-list').html("");
  $('#sell-list').html("");
}

function getSearchResults(q,callback) {
  $.ajax({
    type: 'GET',
    url: '/search',
    data: q,
    success: callback,
    dataType: 'json'
  });
}

function fixSearchBindings() {
  // probably not even necessary but whatever. // TODO implement
}

// also probably not necessary
function renderSearchResults(result) {
  console.log(result);
  $('#search-results').html(result.html);
  fixSearchBindings();
}

function removeFromList(e,action) {
  var book_id = $(e).attr('book_id');
  $.ajax({
      type: 'DELETE',
      url: '/user/books/'+action+'ing',
      data: {book_id:book_id},
      success:function(h){
        //$('#'+action+'-list').html(h.html);
      }
    })
    $(e).parent().parent().fadeOut();
}

function viewMore(e) {
  var book_id = $(e).attr("book_id");
  $.get("/books/"+book_id, function(data){
    // create a modal dialog with the data
    // $(data).modal({
    //   overlayClose:true

    // });

     console.log(data);
     //e.append(data);
     $(e).parent().append(data);
  });
}

function buy(e) {
  console.log("buy");
  var book_id = $(e).attr('book_id');
  var price = $('#price').val();

    $.ajax({
      type: "PUT",
      url: "/user/books/buying",
      data: {book_id:book_id,price:price},
      success:function(h){
        buying.push(book_id);
        // get html for buy list
        // render html in the buy list.
        $(e).parent().parent().parent().fadeOut();
        $('#list-all').html(h.html);
      }
    })
}

function sell(e) {
  var book_id = $(e).attr('book_id');
  var price = $('#price').val();

    $.ajax({
      type: "PUT",
      url: "/user/books/selling",
      data: {book_id:book_id,price:price},
      success:function(h){
        selling.push(book_id);
        // get html for buy list
        // render html in the buy list.
        $(e).parent().parent().fadeOut();
        $('#list-all').html(h.html);
      }
    })
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

  $('form.search').keypress(function(e){
    if(e.which == 13) {
    // TODO implement rate-limiting and local caching
    // for now, update state every single time.
      var q = $('form.search').serialize();
      getSearchResults(q, renderSearchResults);
    }
  });

  $('form.schedule').submit(function(){
    var q = $('form.schedule').serialize();
    console.log(q);
    getSearchResults(q
      , renderSearchResults);
    return false;
  });

  //initialize lists
  
  // hide all auth things to start with
  $("#auth-details p").hide();
  $('#auth-details form').hide();

  // login check to display the correct auth prompt
  $.get("/logincheck",function(r){
    if(r.login){
      $("#auth-details p").show();
      $("#auth-details #user-identifier").text(r.andrew);
      loggedIn = true;
      initializeLists();
    }else{
      $('#auth-details form').show();
      loggedIn = false;
    }
  });

  $('form.schedule').hide();
  $('a.search').click(function(){
    $('form.schedule').hide();
    $('form.search').show();
  });
  $('a.schedule').click(function(){
    $('form.search').hide();
    $('form.schedule').show();
  });

});
