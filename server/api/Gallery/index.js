var express = require('express');
var controller = require('./Gallery.controller');
import validations from './validation';
var router = express.Router();

router.get('/', controller.index);

router.delete('/:galleryId',validations.validateAuthorization, controller.deleteGallery);

module.exports = router;
