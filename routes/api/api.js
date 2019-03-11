var express = require('express');
var router = express.Router();
const environment = require('../../environment.js');

router.use(function timeLog(err, req, res, next) {
    console.log(req.path);
    next();
});

router.use('/products', require('./products'));
router.use('/product', require('./product'));
router.use('/position', require('./position'));
router.use('/table', require('./table'));
router.use('/attributes', require('./attributes'));

module.exports = router;