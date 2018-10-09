'use strict';

var express = require('express');
var controller = require('./oauth.controller');
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

var router = express.Router();

// 01. GET   /api/oauth/
router.get('/', validations.validateAuthorization, controller.index);

// 02. POST   /api/oauth/login
router.post('/login', controller.login);

//03 . POST /api/oauth/register
router.post('/register', validate(validations.registerValidate), controller.register);

//04 . DELETE /api/oauth/delete
router.delete('/:userId', validations.validateAuthorization, validate(validations.deleteUserId), controller.deleteUser);

//05 . UPDATE /api/oauth/
router.put('/', validations.validateAuthorizationUser, validate(validations.updateUser), controller.updateUser);

//05 .  POST /api/oauth/userAvatar
router.post('/userAvatar', validations.validateAuthorizationUser, controller.uploadUserAvatar);

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
