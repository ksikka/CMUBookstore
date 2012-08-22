
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Tartan Texbooks	', user:req.session.user, flash:req.flash() });
};

exports.prettysplash = function(req,res){
  res.render('home', { title: 'Tartan Texbooks', flash:req.flash() });
};
