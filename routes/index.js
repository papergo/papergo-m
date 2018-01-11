var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/free_coin', function(req, res, next) {
    res.render('ad');
});

router.get('/mall', function(req, res, next) {
    res.render('shop');
});

router.get('/devices', function(req, res, next) {
    res.render('lbs');
});

module.exports = router;
