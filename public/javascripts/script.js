
$('document').ready(function(){

  /* A few initialization things */

  /* Hide the ajax-loader image */
  $('#ajaxloader').hide();

  /* Hide the ajax-loader image */
  $.ajaxSetup({
    error: function(a,b,c) { console.log(a); console.log(b); console.log(c); alert("Error: See logs"); },
    beforeSend: function(){$('#ajaxloader').show()},
    complete: function(){$('#ajaxloader').hide()}
  });

  var ajaxify = function(self){
    $.ajax({
        type: $(self).attr("method"),
        url: $(self).attr("action"),
        data: $(self).serialize(),
        success: function(d){
          $(self).next().remove();
          $(self).after(d);
        },
        dataType: 'html'
    });
    return false;
  }

    /* The Bindings */
  $('#andrew form').submit(function(){return ajaxify(this);});
  
  $('#sell form').keydown(function(){return ajaxify(this);});

});
