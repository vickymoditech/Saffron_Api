var express = require('express');
var controller = require('./Service.controller');
import validations from './validation';
import validate from 'express-validation';
var router = express.Router();
import {errorJsonResponse} from '../../config/commonHelper';


router.get('/', controller.index);

router.delete('/:serviceId',validations.validateAuthorization,validate(validations.deleteServiceId),controller.deleteService);

router.use(function(err, req, res, next){
    res.status(400).json(errorJsonResponse(err));
});


module.exports = router;
