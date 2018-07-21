'use strict';

var express = require('express');
var controller = require('./WebSiteHome.controller');
import validations from './validation';


var router = express.Router();

// 01. GET   /api/WebSiteHomes/
// API to Get all the slider images
router.get('/',validations.validateAuthorization, controller.index);


//02. Delete /api/WebSiteHomes/
// API to delete the slider images
router.delete('/:imageId',validations.validateAuthorization, controller.deleteHomeImage);


//02. Update flag /api/WebSiteHomes/
// API to update flag of slider images
router.put('/:imageId',validations.validateAuthorization,controller.updateHomeImage);


//03. Update flag /api/WebSiteHomes/
// API to upload slider images
router.post('/',validations.validateAuthorization,controller.uploadHomeImage);


module.exports = router;
