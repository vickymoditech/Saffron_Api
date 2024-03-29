'use strict';

var _validation = require('./validation');

var _validation2 = _interopRequireDefault(_validation);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _commonHelper = require('../../config/commonHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var controller = require('./TimeSlot.controller');


var router = express.Router();

//Get All Time Slot (for User) time slot display according to current time
router.get('/', controller.index);

//Get All Time Slot
router.get('/GetAllTimeSlots', _validation2.default.validateAuthorization, controller.getAllTimeSlot);

//Add new Time Slot
router.post('/', _validation2.default.validateAuthorization, (0, _expressValidation2.default)(_validation2.default.addTimeSlot), controller.addTimeSlot);

//Update Time Slot
router.put('/', (0, _expressValidation2.default)(_validation2.default.editTimeSlot), controller.editTimeSlot);

//Delete Time Slot
router.delete('/:timeSlot_id', _validation2.default.validateAuthorization, controller.deleteTimeSlot);

router.use(function (err, req, res, next) {
    let allErrorField = [];
    for (let i = 0; i < err.errors.length; i++) {
        let Single_Object = {
            Error: err.errors[i].messages.toString().replace(/"/g, '')
        };
        allErrorField.push(Single_Object);
    }
    res.status(400).json((0, _commonHelper.errorJsonResponse)(allErrorField, allErrorField));
});

module.exports = router;
//# sourceMappingURL=index.js.map
