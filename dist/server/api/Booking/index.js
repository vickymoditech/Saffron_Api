'use strict';

var _validation = require('./validation');

var _validation2 = _interopRequireDefault(_validation);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _commonHelper = require('../../config/commonHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var controller = require('./Booking.controller');

var router = express.Router();

//New Booking
router.post('/', _validation2.default.validateAuthorizationUser, (0, _expressValidation2.default)(_validation2.default.newBookingOrder), controller.index);

router.get('/', _validation2.default.validateAuthorization, controller.getBookingOrder);

router.put('/:orderId', _validation2.default.validateAuthorization, controller.updateBookingOrder);

router.get('/TeamMemberOrder/:teamMemberId', _validation2.default.validateAuthorization, controller.getTeamMemberBookingOrder);

router.use(function (err, req, res, next) {
    let arrayMessages = [];
    let allErrorField;
    for (let i = 0; i < err.errors.length; i++) {
        let Single_error = err.errors[i].messages.toString().replace(/"/g, '');
        arrayMessages.push(Single_error);
    }
    allErrorField = arrayMessages.join(',');
    res.status(400).json((0, _commonHelper.errorJsonResponse)(allErrorField, allErrorField));
});

module.exports = router;
//# sourceMappingURL=index.js.map
