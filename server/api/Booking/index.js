import validations from './validation';
import validate from 'express-validation';

var express = require('express');
var controller = require('./Booking.controller');

var router = express.Router();

router.get('/', validations.validateAuthorization, controller.index);

router.use(function (err, req, res, next) {
    let allErrorField = [];
    for (let i = 0; i < err.errors.length; i++) {
        let Single_Object = {
            Error: err.errors[i].messages.toString().replace(/"/g, '')
        };
        allErrorField.push(Single_Object);
    }
    res.status(400).json(errorJsonResponse(allErrorField, allErrorField));
});

module.exports = router;
