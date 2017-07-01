var express = require('express');
var router = express.Router();

router.get('/:hash', function(req, res, next) {
  res.render('index', { hash: req.params.hash });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('what');
  res.render('index');
});


module.exports = router;
