'use strict';

var express = require('express');
var controller = require('./oauth.controller');
import validations from './validation';

var router = express.Router();

// 01. GET   /api/oauth/
// API to Get all the login users
router.get('/', validations.validateAuthorization, controller.index);

// 02. POST   /api/demos/login
// API to validate user authentication and give auth token
router.post('/login', controller.login);

module.exports = router;
