var express = require('express');
var controller = require('./Product.controller');
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

var router = express.Router();

// 01. GET   /api/Products/
router.get('/', controller.index);

// 02. POST /api/Products/
router.post('/', validations.validateAuthorization, validate(validations.addProductValidate), controller.addNewProduct);

// 02. PUT /api/Products/
router.put('/', validations.validateAuthorization, validate(validations.updateProductValidate), controller.updateProduct);

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
