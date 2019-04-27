'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Booking = require('./Booking.events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BookingSchema = new _mongoose2.default.Schema({
    id: String,
    customer_id: Number,
    basket: _mongoose2.default.Schema.Types.Mixed,
    teamWiseProductList: _mongoose2.default.Schema.Types.Mixed,
    total: Number,
    bookingDateTime: Date,
    bookingStartTime: Date,
    bookingEndTime: Date,
    status: String,
    column: String,
    customerName: String,
    visited: Boolean,
    statusDateTime: Date
});

(0, _Booking.registerEvents)(BookingSchema);
exports.default = _mongoose2.default.model('Booking', BookingSchema);
//# sourceMappingURL=Booking.model.js.map
