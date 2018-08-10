'use strict';

var express = require('express');
var controller = require('./oauth.controller');
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

var router = express.Router();

// 01. GET   /api/oauth/
// API to Get all the login users
router.get('/', validations.validateAuthorization, controller.index);

// 02. POST   /api/oauth/login
// API to validate user authentication and give auth token
router.post('/login', controller.login);

//03 . POST /api/oauth/register
router.post('/register', validate(validations.registerValidate), controller.register);

//04 . DELETE /api/oauth/delete
router.delete('/:userId',validations.validateAuthorization,validate(validations.deleteUserId),controller.deleteUser);


router.put('/',validations.validateAuthorizationUser,validate(validations.updateUser),controller.updateUser);


router.use(function (err, req, res, next) {
    var allErrorField = "";
    for (var i = 0; i < err.errors.length; i++) {
        allErrorField += err.errors[i].field[0] + ",";
    }
    res.status(400).json(errorJsonResponse(allErrorField + " are invalid", 'Invalid Data'));
});


module.exports = router;
