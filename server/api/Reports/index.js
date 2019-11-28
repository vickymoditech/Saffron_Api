let express = require('express');
let controller = require('./reports.controller');
let router = express.Router();
import validations from './validation';
import validate from 'express-validation';
import {errorJsonResponse} from '../../config/commonHelper';

//01 . GET /api/Reports/topUser
router.get('/topUsers', validations.validateAdminEmployeeAuthorization, controller.getTopUser);

//02 . GET /api/Reports/getTotalBillablePrice
router.get('/getTotalBillablePrice', validations.validateAdminEmployeeAuthorization, controller.getTotalBillablePrice);

//03 . GET /api/Reports/getOrderReport
router.get('/getOrderStatusReport', validations.validateAdminEmployeeAuthorization, controller.getOrderStatusReport);


router.use(function (err, req, res, next) {
    let arrayMessages = [];
    let allErrorField;
    if(err.errors){
        for (let i = 0; i < err.errors.length; i++) {
            let Single_error = err.errors[i].messages.toString().replace(/"/g, '');
            arrayMessages.push(Single_error);
        }
        allErrorField = arrayMessages.join(",");
        res.status(400).json(errorJsonResponse(allErrorField, allErrorField));
    }else{
        next(err);
    }
});

module.exports = router;
