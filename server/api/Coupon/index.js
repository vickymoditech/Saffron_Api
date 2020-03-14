import {errorJsonResponse} from '../../config/commonHelper';
import validations from './validation';
import validate from 'express-validation';

var express = require('express');
var controller = require('./coupon.controller');

var router = express.Router();

router.get('/', validations.validateAuthorization, controller.index);
router.get('/all', controller.GetValidCouponIndex);
router.post('/', validations.validateAuthorization, validate(validations.registerCoupon), controller.create);
router.get('/:couponId/user/:userId', validations.validateAuthorizationUser, controller.upsert);
router.delete('/:couponId', validations.validateAuthorization, controller.destroy);

router.use(function(err, req, res, next) {
    let arrayMessages = [];
    let allErrorField;
    for(let i = 0; i < err.errors.length; i++) {
        let Single_error = err.errors[i].messages.toString()
            .replace(/"/g, '');
        arrayMessages.push(Single_error);
    }
    allErrorField = arrayMessages.join(',');
    res.status(400)
        .json(errorJsonResponse(allErrorField, allErrorField));
});

module.exports = router;
