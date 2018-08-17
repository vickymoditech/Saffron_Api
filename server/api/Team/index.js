var express = require('express');
var controller = require('./Team.controller');
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

var router = express.Router();

router.get('/', controller.index);

router.delete('/:teamId', validations.validateAuthorization, validate(validations.deleteTeamId), controller.deleteTeam);

router.post('/', validations.validateAuthorization, controller.addNewTeam);

router.put('/', validations.validateAuthorization, controller.updateTeam);


router.use(function (err, req, res, next) {
    var allErrorField = "";
    for (var i = 0; i < err.errors.length; i++) {
        allErrorField += err.errors[i].field[0] + ",";
    }
    res.status(400).json(errorJsonResponse(allErrorField + " are invalid", 'Invalid Data'));
});

module.exports = router;
