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
        console.log(h.html);
        $('#'+action+'-list').html(h.html);
        console.log('remove from buy list: '+book_id)
      }
    })
}

function buy(e) {
  var book_id = $(e).attr('book_id');
    $.ajax({
      type: "PUT",
      url: "/user/books/buying",
      data: {book_id:book_id},
      success:function(h){
        buying.push(book_id);
        $(e).addClass('buying');
        // get html for buy list
        // render html in the buy list.
        $('#buy-list').html(h.html);
        console.log("added to buy list: "+book_id)
      }
    })
}

function sell(e) {
  var book_id = $(e).attr('book_id');
    $.ajax({
      type: "PUT",
      url: "/user/books/selling",
      data: {book_id:book_id},
      success:function(h){
        selling.push(book_id);
        $(e).addClass('selling');
        // get html for buy list
        // render html in the buy list.
        $('#sell-list').html(h.html);
        console.log("added to sell list: "+book_id)
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

  $('#search-nav form').keyup(function(){
    // TODO implement rate-limiting and local caching
    // for now, update state every single time.
    q = $('form').serialize();
    getSearchResults(q
      , renderSearchResults);
  });

  // hide all auth things to start with
  $("#auth-details p").hide();
  $('#auth-details form').hide();

  // login check to display the correct auth prompt
  $.get("/logincheck",function(r){
    if(r.login){
      $("#auth-details p").show();
      $("#auth-details #user-identifier").text(r.andrew);
    }else{
      $('#auth-details form').show();
    }
  });

  // login function
  $('#auth-details form').submit(function(){
    var self = this;
    $.post('/andrew',
           $(this).serialize(),
           function(res){
             if (res.login) {
               $(self).hide();
               var andrew = res.andrew;
               $("#user-identifier").text( andrew );
               $("#auth-details p").show();
             } else {
               alert('Login failed: not a valid andrew id');
             }
           });
    return false;
  });

  // logout function
  $('#logout').click(function(){
    $.get("/logout",function(d){
      $('#auth-details p').hide();
      $("#auth-details form input").val("");
      $('#auth-details form').show();
      console.log(d)
    });
  });



});
