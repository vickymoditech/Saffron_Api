var express = require('express');
var controller = require('./Gallery.controller');
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';


var router = express.Router();

router.get('/', controller.index);

router.delete('/:galleryId', validations.validateAuthorization, controller.deleteGallery);

router.post('/', validations.validateAuthorization, controller.addNewGallery);

router.put('/', validations.validateAuthorization, controller.updateGallery);

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
