
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log(req.session.firstTime);
  res.render('index', { title: 'Tartan Textbooks', user:req.session.user, flash:req.flash(), firstTime:req.session.firstTime});
};

exports.prettysplash = function(req,res){
  res.render('home', { title: 'Tartan Textbooks', flash:req.flash() });
};
