var express = require('express');
var controller = require('./Basket.controller');

var router = express.Router();

router.get('/', controller.index);

router.post('/', controller.insert);

router.use(function (err, req, res, next) {
    let arrayMessages = [];
    let allErrorField ;
    for (let i = 0; i < err.errors.length; i++) {
        let Single_error = err.errors[i].messages.toString().replace(/"/g, '');
        arrayMessages.push(Single_error);
    }
    allErrorField = arrayMessages.join(",");
    res.status(400).json(errorJsonResponse(allErrorField, allErrorField));
});

module.exports = router;
