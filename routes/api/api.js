var express = require('express');
var router = express.Router();
const environment = require('../../environment.js');

router.use(function timeLog(err, req, res, next) {
    console.log(req.path);
    next();
});

router.use('/product', require('./product'));


module.exports = router;