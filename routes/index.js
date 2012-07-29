
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', user:req.session.user, flash:req.flash() });
};

exports.prettysplash = function(req,res){
  res.render('home', { title: 'Express', flash:req.flash() });
};
