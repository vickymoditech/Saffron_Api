'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _Booking = require('../Booking/Booking.model');

var _Booking2 = _interopRequireDefault(_Booking);

var _TimeSlot = require('../TimeSlot/TimeSlot.model');

var _TimeSlot2 = _interopRequireDefault(_TimeSlot);

var _index = require('../Socket/index');

var _commonHelper = require('../../config/commonHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let moment = require('moment-timezone');
var _ = require('lodash');

//todo find running late orders
setInterval((0, _asyncToGenerator3.default)(function* () {
    try {

        let startDayDateTime = moment().tz('Asia/Kolkata').startOf('day').format();
        let NormalDateStartDateTime = new Date(startDayDateTime);
        let currentTime = moment.tz('Asia/Kolkata').format();
        let currentDate = new Date(currentTime);

        let _LateBooking = yield _Booking2.default.find({
            status: 'waiting',
            column: 'recent orders',
            bookingStartTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: currentDate.toUTCString()
            }
        }).exec();

        yield _promise2.default.all(_LateBooking.map((() => {
            var _ref2 = (0, _asyncToGenerator3.default)(function* (singleBooking) {
                let statusDateTime = currentDate.toUTCString();

                let updateResult = yield _Booking2.default.update({ id: singleBooking.id }, {
                    status: 'late',
                    column: 'running late',
                    statusDateTime: statusDateTime
                }).exec();

                if (updateResult) {
                    if (updateResult.nModified === 1 || updateResult.n === 1) {

                        let _singleLateBooking = _LateBooking.find(function (singleLateBooking) {
                            return singleLateBooking.id === singleBooking.id;
                        });

                        let sodPublishMessage = {
                            message: 'running late',
                            data: {
                                _id: _singleLateBooking._id,
                                id: _singleLateBooking.id,
                                customer_id: _singleLateBooking.customer_id,
                                customerName: _singleLateBooking.customerName,
                                basket: _singleLateBooking.basket,
                                //teamWiseProductList: _singleLateBooking.teamWiseProductList,
                                total: _singleLateBooking.total,
                                bookingDateTime: _singleLateBooking.bookingDateTime,
                                bookingStartTime: _singleLateBooking.bookingStartTime,
                                bookingEndTime: _singleLateBooking.bookingEndTime,
                                status: 'late',
                                column: 'running late',
                                statusDateTime: statusDateTime
                            }
                        };
                        yield (0, _index.socketPublishMessage)('SOD', sodPublishMessage);

                        //ToDO send to TeamMember
                        _singleLateBooking.teamWiseProductList.map((() => {
                            var _ref3 = (0, _asyncToGenerator3.default)(function* (singleObject) {
                                let publishMessage = {
                                    message: 'running late',
                                    data: {
                                        _id: _singleLateBooking._id,
                                        id: _singleLateBooking.id,
                                        customer_id: _singleLateBooking.customer_id,
                                        customerName: _singleLateBooking.customerName,
                                        basket: singleObject.productItem,
                                        total: _singleLateBooking.total,
                                        bookingDateTime: _singleLateBooking.bookingDateTime,
                                        bookingStartTime: _singleLateBooking.bookingStartTime,
                                        bookingEndTime: _singleLateBooking.bookingEndTime,
                                        status: 'late',
                                        column: 'running late',
                                        statusDateTime: statusDateTime
                                    }
                                };
                                yield (0, _index.socketPublishMessage)(singleObject.id, publishMessage);
                            });

                            return function (_x2) {
                                return _ref3.apply(this, arguments);
                            };
                        })());
                    } else {
                        console.log(updateResult);
                    }
                } else {
                    console.log('contact to developer');
                }
            });

            return function (_x) {
                return _ref2.apply(this, arguments);
            };
        })()));
    } catch (error) {
        console.log(error);
    }
}), 10000);

setInterval((0, _asyncToGenerator3.default)(function* () {

    let currentTime = moment.tz('Asia/Kolkata').format();
    let currentDate = new Date(currentTime);
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    if (hours === 1 && minutes === 10) {
        _TimeSlot2.default.find({}, { __v: 0, _id: 0 }).then((() => {
            var _ref5 = (0, _asyncToGenerator3.default)(function* (timeSlotList, err) {
                if (!err) {

                    timeSlotList.forEach((() => {
                        var _ref6 = (0, _asyncToGenerator3.default)(function* (singleTimeSlot) {
                            let split = singleTimeSlot.start_time.split(":");
                            let NormalStartDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), split[0], split[1], 0);
                            let BookingAdd = new _Booking2.default({
                                id: (0, _commonHelper.getGuid)(),
                                customer_id: 10000000,
                                basket: {},
                                teamWiseProductList: {},
                                total: 0,
                                bookingDateTime: currentDate.toUTCString(),
                                bookingStartTime: NormalStartDateTime.toUTCString(),
                                bookingEndTime: NormalStartDateTime.toUTCString(),
                                status: 'first Order',
                                column: 'first Order',
                                customerName: 'Developer Test',
                                visited: false,
                                statusDateTime: currentDate.toUTCString()
                            });
                            yield BookingAdd.save().then((() => {
                                var _ref7 = (0, _asyncToGenerator3.default)(function* (InsertBooking, err) {
                                    if (!err) {
                                        if (InsertBooking) {
                                            console.log("Save successfully");
                                        } else {
                                            console.log(InsertBooking);
                                        }
                                    } else {
                                        console.log(err);
                                    }
                                });

                                return function (_x6, _x7) {
                                    return _ref7.apply(this, arguments);
                                };
                            })());
                        });

                        return function (_x5) {
                            return _ref6.apply(this, arguments);
                        };
                    })());
                } else {
                    console.log(err);
                }
            });

            return function (_x3, _x4) {
                return _ref5.apply(this, arguments);
            };
        })());
    }
}), 60000);
//# sourceMappingURL=index.js.map
