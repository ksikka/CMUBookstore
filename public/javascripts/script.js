
$('document').ready(function(){

  /* A few initialization things */

  /* Hide the ajax-loader image */
  $('#ajaxloader').hide();

  /* Hide the ajax-loader image */
  $.ajaxSetup({
    error: function(a,b,c) { console.log(a); console.log(b); console.log(c); alert('Error: See logs'); },
    beforeSend: function(){$('#ajaxloader').show()},
    complete: function(){$('#ajaxloader').hide()}
  });

  var bindAll;

  var ajaxify = function(self,ret){
    $.ajax({
        type: $(self).attr('method'),
        url: $(self).attr('action'),
        data: $(self).serialize(),
        success: function(d){
          $(self).next().remove();
          $(self).after(d);
          bindAll();
        },
        dataType: 'html'
    });
    return ret;
  }

    /* The Bindings */
  var bindAll = function() {
    $('#andrew form').submit(function(){return ajaxify(this,false);});
    $('#sell form, #buy form').keyup(function(){return ajaxify(this,true);});
    /* Ajax PUT and DELETE of (buying|selling) books */
    $('#sell a').on("click",function(){
      alert("hi");
      $.ajax({
        type: 'PUT',
        url: '/user/books/selling/add',
        data: $(self).attr('book_id'),
        success: function(d){
          alert(d);
        }
      });
    });

  }
  bindAll();
});
