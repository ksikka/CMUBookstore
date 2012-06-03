$('document').ready(function(){
  $('form').submit(function(){
    /* this is to clear the child input boxes */
    /* $(this).children('input').val(""); */
    $.post('/suscribe'
         , 'inq=' + $(this).children('input').val()
         , function(d){
           console.log(d);
           $('#data').html(d);
         }
    );
    return false;
  });
});
