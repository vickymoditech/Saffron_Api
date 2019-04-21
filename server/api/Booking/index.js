import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

var express = require('express');
var controller = require('./Booking.controller');

var router = express.Router();

//New Booking
router.post('/', validations.validateAuthorizationUser, validate(validations.newBookingOrder), controller.index);

router.get('/', validations.validateAuthorization, controller.getBookingOrder);

router.put('/:orderId', validations.validateAuthorization, controller.updateBookingOrder);

router.get('/TeamMemberOrder/:teamMemberId', validations.validateAuthorization, controller.getTeamMemberBookingOrder);

router.use(function (err, req, res, next) {
    let arrayMessages = [];
    let allErrorField;
    for (let i = 0; i < err.errors.length; i++) {
        let Single_error = err.errors[i].messages.toString()
            .replace(/"/g, '');
        arrayMessages.push(Single_error);
    }
    allErrorField = arrayMessages.join(',');
    res.status(400)
        .json(errorJsonResponse(allErrorField, allErrorField));
});

module.exports = router;
