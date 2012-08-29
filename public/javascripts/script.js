var query = {};
var searchResults = [];
var buying = [];
var selling = [];

var loggedIn;

function initializeLists() {
  $.get('/user/books/buying',function(h){
      $('#list-all').html(h.html);
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
  $('.papers:not(.expanded)').click(function(){
    $('.papers.expanded').removeClass('expanded');
    $(this).addClass('expanded');
  });

  $('.papers.expanded').click(function(){
    $('.papers.expanded').removeClass('expanded');
  });
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
        //$('#'+action+'-list').html(h.html);
      }
    })
    $(e).parent().parent().fadeOut();
}

function viewMore(e) {
  var book_id = $(e).attr("book_id");
  $.get("/books/"+book_id, function(data){
     console.log(data);
     //e.append(data);
     $(e).parent().append(data);
  });
}

function buy(e) {
  var book_id = $(e).attr('book_id');
  var price = $(e).children('.price').val();

  $.ajax({
    type: "PUT",
    url: "/user/books/buying",
    data: {book_id:book_id,price:price},
    success:function(h){
      buying.push(book_id);
      // get html for buy list
      // render html in the buy list.
      $(e).parent().parent().parent().parent().fadeOut();
      $('#list-all').html(h.html);
    }
  });
  return false;
}

function sell(e) {
  var book_id = $(e).attr('book_id');
  var price = $(e).children('.price').val();

  $.ajax({
    type: "PUT",
    url: "/user/books/selling",
    data: {book_id:book_id,price:price},
    success:function(h){
      selling.push(book_id);
      // get html for buy list
      // render html in the buy list.
      $(e).parent().parent().parent().parent().fadeOut();
      $('#list-all').html(h.html);
    }
  });
  return false;
}


$('document').ready(function(){

  /* Hide the ajax-loader image */
  $('#ajaxloader').hide();

  /* Hide the ajax-loader image */
  $.ajaxSetup({
    error: function(a,b,c) { console.log(a+':\n'+c); alert('Sorry there was an error. Contact ksikka@cmu.edu if the problem persists.'); },
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
