
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Tartan Textbooks	', user:req.session.user, flash:req.flash() });
};

exports.prettysplash = function(req,res){
  res.render('home', { title: 'Tartan Textbooks', flash:req.flash() });
};
