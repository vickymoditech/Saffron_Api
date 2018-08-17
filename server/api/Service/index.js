var express = require('express');
var controller = require('./Service.controller');
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

var router = express.Router();

router.get('/', controller.index);

router.delete('/:serviceId', validations.validateAuthorization, validate(validations.deleteServiceId), controller.deleteService);

router.post('/', validations.validateAuthorization, controller.addNewService);

router.put('/', validations.validateAuthorization, controller.updateService);


router.use(function (err, req, res, next) {
    var allErrorField = "";
    for (var i = 0; i < err.errors.length; i++) {
        allErrorField += err.errors[i].field[0] + ",";
    }
    res.status(400).json(errorJsonResponse(allErrorField + " are invalid", 'Invalid Data'));
});

module.exports = router;
