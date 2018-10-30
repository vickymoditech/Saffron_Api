var express = require('express');
var controller = require('./Basket.controller');

var router = express.Router();

router.get('/', controller.index);

router.post('/', controller.insert);

module.exports = router;
