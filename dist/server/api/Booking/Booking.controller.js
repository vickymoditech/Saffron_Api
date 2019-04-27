'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTeamMemberBookingOrder = exports.updateBookingOrder = exports.getBookingOrder = exports.index = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// New Booking
let index = exports.index = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (req, res) {
        try {
            let startTimeHours = req.body.startTime.hours;
            let startTimeMinutes = req.body.startTime.minutes;
            let endTimeHours = req.body.endTime.hours;
            let endTimeMinutes = req.body.endTime.minutes;
            let bookingProduct = req.body.bookingProduct;
            let totalTime = 0;
            let allProductFound = true;
            let userId = req.decoded.user.userId;
            let fullName = req.decoded.user.first_name + ' ' + req.decoded.user.last_name;
            let bookingStartDateTime = '';
            let bookingEndDateTime = '';
            let momentDateTime = moment().tz('Asia/Kolkata').format();
            let currentDate = new Date(momentDateTime);
            let year = currentDate.getFullYear();
            let month = currentDate.getMonth();
            let date = currentDate.getDate();
            let NormalStartDateTime = new Date(year, month, date, startTimeHours, startTimeMinutes, 0);
            let NormalEndDateTime = new Date(year, month, date, endTimeHours, endTimeMinutes, 0);
            let totalPrice = 0;
            let not_acceptAble = false;

            //Calculate the total time
            yield _promise2.default.all(bookingProduct.map((() => {
                var _ref2 = (0, _asyncToGenerator3.default)(function* (singleBookingProduct) {
                    let TeamMemberProductSingle = yield getTeamMemberProductList(singleBookingProduct.product_id, singleBookingProduct.teamMember_id);

                    let ProductItem = yield getProduct(singleBookingProduct.product_id);

                    if (ProductItem !== null) {
                        totalPrice += ProductItem.price;
                    } else {
                        allProductFound = false;
                    }

                    if (TeamMemberProductSingle !== null) {
                        totalTime += TeamMemberProductSingle.approxTime;
                    } else {
                        allProductFound = false;
                    }
                });

                return function (_x3) {
                    return _ref2.apply(this, arguments);
                };
            })()));

            if (!allProductFound) {
                let message = 'your order has been canceled, so please restart your application and place the booking again. we are sorry for this trouble.';
                res.status(400).json((0, _commonHelper.errorJsonResponse)(message, message));
            } else {

                //check currentTime and booking selected time.
                if (currentDate.getTime() < NormalEndDateTime.getTime()) {

                    let _LastBooking = yield getLastBookingOrder(NormalStartDateTime, NormalEndDateTime);

                    if (_LastBooking !== null && _LastBooking.visited === false) {

                        //Get Booking LastTime
                        let lastBookingDateTimeCalculation = moment.tz(_LastBooking.bookingEndTime, 'Asia/Kolkata').format();
                        let addMinute = new Date(lastBookingDateTimeCalculation);
                        if (currentDate.getTime() < addMinute.getTime()) {
                            addMinute.setMinutes(addMinute.getMinutes() + totalTime);
                            //set arrivalTime
                            bookingStartDateTime = new Date(_LastBooking.bookingEndTime).toUTCString();
                            //set order finish time.
                            bookingEndDateTime = addMinute.toUTCString();
                        } else {
                            let currentTimeWithZeroMinutes = new Date(year, month, date, currentDate.getHours(), currentDate.getMinutes(), 0);
                            bookingStartDateTime = currentTimeWithZeroMinutes.toUTCString();
                            addMinute = currentTimeWithZeroMinutes;
                            addMinute.setMinutes(currentTimeWithZeroMinutes.getMinutes() + totalTime);
                            bookingEndDateTime = addMinute.toUTCString();
                        }

                        const diffTime = Math.abs(NormalEndDateTime.getTime() - addMinute.getTime());
                        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                        if (!(NormalEndDateTime.getTime() >= addMinute.getTime() && diffMinutes >= 0)) {
                            not_acceptAble = true;
                        }
                    } else {

                        //Never execute this part.
                        //first order set stating time and add minutes and generate end time
                        if (currentDate.getTime() < NormalStartDateTime.getTime()) {
                            bookingStartDateTime = NormalStartDateTime.toUTCString();
                            let addMinute = NormalStartDateTime;
                            addMinute.setMinutes(NormalStartDateTime.getMinutes() + totalTime);
                            bookingEndDateTime = addMinute.toUTCString();
                        } else {
                            bookingStartDateTime = currentDate.toUTCString();
                            let addMinute = currentDate;
                            addMinute.setMinutes(currentDate.getMinutes() + totalTime);
                            bookingEndDateTime = addMinute.toUTCString();
                        }
                    }

                    if (!not_acceptAble) {
                        //Generate the Basket Response.
                        let BasketResponseGenerator = yield BasketGenerator(bookingProduct);

                        let BookingAdd = new _Booking2.default({
                            id: (0, _commonHelper.getGuid)(),
                            customer_id: userId,
                            basket: BasketResponseGenerator.basketResponse,
                            teamWiseProductList: BasketResponseGenerator.teamWiseProductList,
                            total: totalPrice,
                            bookingDateTime: currentDate.toUTCString(),
                            bookingStartTime: bookingStartDateTime,
                            bookingEndTime: bookingEndDateTime,
                            status: 'waiting',
                            column: 'recent orders',
                            customerName: fullName,
                            visited: false,
                            statusDateTime: currentDate.toUTCString()
                        });
                        BookingAdd.save().then((() => {
                            var _ref3 = (0, _asyncToGenerator3.default)(function* (InsertBooking, err) {
                                if (!err) {
                                    if (InsertBooking) {
                                        let responseObject = {
                                            id: InsertBooking.id,
                                            customer_id: InsertBooking.customer_id,
                                            customerName: fullName,
                                            productList: InsertBooking.basket,
                                            total: InsertBooking.total,
                                            bookingDateTime: moment.tz(InsertBooking.bookingDateTime, 'Asia/Kolkata').format(),
                                            arrivalTime: moment.tz(InsertBooking.bookingStartTime, 'Asia/Kolkata').format(),
                                            bookingEndTime: moment.tz(InsertBooking.bookingEndTime, 'Asia/Kolkata').format(),
                                            status: InsertBooking.status,
                                            column: InsertBooking.column,
                                            statusDateTime: moment.tz(InsertBooking.statusDateTime, 'Asia/Kolkata').format(),
                                            _id: InsertBooking._id
                                        };

                                        //ProductItemStore into BookingItem Collection.
                                        yield _promise2.default.all(bookingProduct.map((() => {
                                            var _ref4 = (0, _asyncToGenerator3.default)(function* (singleBookingProduct) {
                                                let BookingItemsAdd = new _BookingItems2.default({
                                                    id: (0, _commonHelper.getGuid)(),
                                                    booking_id: InsertBooking.id,
                                                    product_id: singleBookingProduct.product_id,
                                                    team_id: singleBookingProduct.teamMember_id,
                                                    active: true
                                                });
                                                BookingItemsAdd.save().then((() => {
                                                    var _ref5 = (0, _asyncToGenerator3.default)(function* (InsertBookingItems, err) {
                                                        if (!err) {
                                                            if (!InsertBookingItems) {
                                                                res.status(400).json((0, _commonHelper.errorJsonResponse)('Error in db BookingItems response', 'Error in db BookingItems response'));
                                                            }
                                                        } else {
                                                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err, 'Contact to your Developer'));
                                                        }
                                                    });

                                                    return function (_x7, _x8) {
                                                        return _ref5.apply(this, arguments);
                                                    };
                                                })());
                                            });

                                            return function (_x6) {
                                                return _ref4.apply(this, arguments);
                                            };
                                        })()));

                                        //ToDO send to TeamMember
                                        BasketResponseGenerator.teamWiseProductList.map((() => {
                                            var _ref6 = (0, _asyncToGenerator3.default)(function* (singleObject) {
                                                let publishMessage = {
                                                    message: 'new order',
                                                    data: {
                                                        _id: InsertBooking._id,
                                                        id: InsertBooking.id,
                                                        customer_id: InsertBooking.customer_id,
                                                        customerName: fullName,
                                                        basket: singleObject.productList,
                                                        total: InsertBooking.total,
                                                        bookingDateTime: InsertBooking.bookingDateTime,
                                                        bookingStartTime: InsertBooking.bookingStartTime,
                                                        bookingEndTime: InsertBooking.bookingEndTime,
                                                        status: InsertBooking.status,
                                                        column: InsertBooking.column,
                                                        statusDateTime: InsertBooking.statusDateTime
                                                    }
                                                };
                                                yield (0, _index.socketPublishMessage)(singleObject.id, publishMessage);
                                            });

                                            return function (_x9) {
                                                return _ref6.apply(this, arguments);
                                            };
                                        })());

                                        //ToDO send to SOD
                                        let publishMessage = {
                                            message: 'new order',
                                            data: {
                                                _id: InsertBooking._id,
                                                id: InsertBooking.id,
                                                customer_id: InsertBooking.customer_id,
                                                customerName: fullName,
                                                basket: InsertBooking.basket,
                                                //teamWiseProductList: BasketResponseGenerator.teamWiseProductList,
                                                total: InsertBooking.total,
                                                bookingDateTime: InsertBooking.bookingDateTime,
                                                bookingStartTime: InsertBooking.bookingStartTime,
                                                bookingEndTime: InsertBooking.bookingEndTime,
                                                status: InsertBooking.status,
                                                column: InsertBooking.column,
                                                statusDateTime: InsertBooking.statusDateTime
                                            }
                                        };

                                        yield (0, _index.socketPublishMessage)('SOD', publishMessage);

                                        res.status(200).json({
                                            totalTime,
                                            orderPlace: responseObject
                                        });
                                    } else {
                                        res.status(400).json((0, _commonHelper.errorJsonResponse)('Error in db response', 'Error in db response'));
                                    }
                                } else {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err, 'Contact to your Developer'));
                                }
                            });

                            return function (_x4, _x5) {
                                return _ref3.apply(this, arguments);
                            };
                        })());
                    } else {
                        res.status(406).json((0, _commonHelper.errorJsonResponse)('your order is not Accepted, please select another time slot and book your order', 'your order is not Accepted, please select another time slot and book your order'));
                    }
                } else {
                    let message = 'you have selected wrong time, please choose the valid time slot.';
                    res.status(400).json((0, _commonHelper.errorJsonResponse)(message, message));
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    return function index(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let BasketGenerator = (() => {
    var _ref7 = (0, _asyncToGenerator3.default)(function* (bookingProduct) {
        try {

            let basketResponse = [];
            let teamWiseProductList = [];

            yield _promise2.default.all(bookingProduct.map((() => {
                var _ref8 = (0, _asyncToGenerator3.default)(function* (bookingItem) {

                    let productItem = yield getProduct(bookingItem.product_id);
                    let productTeam = yield getTeam(bookingItem.teamMember_id);
                    let object = {
                        productItem,
                        productTeam
                    };
                    basketResponse.push(object);

                    let teamMember = teamWiseProductList.find(function (teamMember) {
                        return teamMember.id === productTeam.id;
                    });
                    if (!teamMember) {
                        let pushData = {
                            id: productTeam.id,
                            productList: [],
                            orderStatus: false
                        };
                        pushData.productList.push(productItem);
                        teamWiseProductList.push(pushData);
                    } else {
                        teamMember.productList.push(productItem);
                    }
                });

                return function (_x11) {
                    return _ref8.apply(this, arguments);
                };
            })()));

            return { basketResponse, teamWiseProductList };
        } catch (error) {
            console.log(error);
            return error;
        }
    });

    return function BasketGenerator(_x10) {
        return _ref7.apply(this, arguments);
    };
})();

let getProduct = (() => {
    var _ref9 = (0, _asyncToGenerator3.default)(function* (productId, index = 0) {
        let listProductList = (0, _commonHelper.getCache)('productList');
        if (listProductList !== null) {
            let singleProduct = listProductList.find(function (product) {
                return product.id === productId;
            });
            if (singleProduct) {
                return singleProduct;
            } else {
                if (index === 0) {
                    return getProduct(productId, 1);
                } else {
                    return null;
                }
            }
        } else {
            listProductList = yield _Product2.default.find({}, { _id: 0, __v: 0, description: 0, date: 0, sex: 0 }).exec();
            (0, _commonHelper.setCache)('productList', listProductList);
            return getProduct(productId, 1);
        }
    });

    return function getProduct(_x12) {
        return _ref9.apply(this, arguments);
    };
})();

let getLastBookingOrder = (() => {
    var _ref10 = (0, _asyncToGenerator3.default)(function* (NormalStartDateTime, NormalEndDateTime) {

        let _LastBookingOrder = yield _Booking2.default.findOneAndUpdate({
            visited: false,
            bookingEndTime: { $gte: NormalStartDateTime.toUTCString(), $lte: NormalEndDateTime.toUTCString() }
        }, { $set: { visited: true } }, { sort: { bookingEndTime: -1 } }).exec();

        if (_LastBookingOrder === null)
            //Todo should not be received null value
            return getLastBookingOrder(NormalStartDateTime, NormalEndDateTime);else if (_LastBookingOrder.visited === true) return getLastBookingOrder(NormalStartDateTime, NormalEndDateTime);else return _LastBookingOrder;
    });

    return function getLastBookingOrder(_x13, _x14) {
        return _ref10.apply(this, arguments);
    };
})();

let getTeam = (() => {
    var _ref11 = (0, _asyncToGenerator3.default)(function* (teamId, index = 0) {
        let teamList = (0, _commonHelper.getCache)('teamList');
        if (teamList !== null) {
            let singleTeam = teamList.find(function (team) {
                return team.id === teamId;
            });
            if (singleTeam) {
                return singleTeam;
            } else {
                if (index === 0) {
                    return getTeam(teamId, 1);
                } else {
                    return null;
                }
            }
        } else {
            teamList = yield _Team2.default.find({}, { _id: 0, __v: 0, description: 0 }).exec();
            (0, _commonHelper.setCache)('teamList', teamList);
            return getTeam(teamId, 1);
        }
    });

    return function getTeam(_x15) {
        return _ref11.apply(this, arguments);
    };
})();

let getTeamMemberProductList = (() => {
    var _ref12 = (0, _asyncToGenerator3.default)(function* (product_id, teamMember_id, index = 0) {
        let teamMemberProductList = (0, _commonHelper.getCache)('teamMemberProductList');
        if (teamMemberProductList !== null) {
            let singleTeamMemberProduct = teamMemberProductList.find(function (teamMemberProduct) {
                return teamMemberProduct.product_id === product_id && teamMember_id === teamMember_id;
            });
            if (singleTeamMemberProduct) {
                return singleTeamMemberProduct;
            } else {
                if (index === 0) {
                    return getTeamMemberProductList(product_id, teamMember_id, 1);
                } else {
                    return null;
                }
            }
        } else {
            teamMemberProductList = yield _TeamMemberProduct2.default.find().exec();
            (0, _commonHelper.setCache)('teamMemberProductList', teamMemberProductList);
            return getTeamMemberProductList(product_id, teamMember_id, 1);
        }
    });

    return function getTeamMemberProductList(_x16, _x17) {
        return _ref12.apply(this, arguments);
    };
})();

let getBookingOrder = exports.getBookingOrder = (() => {
    var _ref13 = (0, _asyncToGenerator3.default)(function* (req, res) {
        try {

            let startDayDateTime = moment().tz('Asia/Kolkata').startOf('day').format();
            let endDayDateTime = moment().tz('Asia/Kolkata').endOf('day').format();
            let NormalDateStartDateTime = new Date(startDayDateTime);
            let NormalDateEndDateTime = new Date(endDayDateTime);

            let responseObject = {
                runningOrder: [],
                runningLate: [],
                recentOrders: []
            };

            let recentOrders = yield _Booking2.default.find({
                status: 'waiting',
                bookingEndTime: {
                    $gte: NormalDateStartDateTime.toUTCString(),
                    $lte: NormalDateEndDateTime.toUTCString()
                }
            }, { teamWiseProductList: 0 }).sort({ bookingStartTime: 1 }).exec();

            let runningOrders = yield _Booking2.default.find({
                status: 'process',
                bookingEndTime: {
                    $gte: NormalDateStartDateTime.toUTCString(),
                    $lte: NormalDateEndDateTime.toUTCString()
                }
            }, { teamWiseProductList: 0 }).sort({ bookingStartTime: 1 }).exec();

            let lateOrders = yield _Booking2.default.find({
                status: 'late',
                bookingEndTime: {
                    $gte: NormalDateStartDateTime.toUTCString(),
                    $lte: NormalDateEndDateTime.toUTCString()
                }
            }, { teamWiseProductList: 0 }).sort({ bookingStartTime: 1 }).exec();

            responseObject.recentOrders = recentOrders;
            responseObject.runningLate = lateOrders;
            responseObject.runningOrder = runningOrders;

            res.status(200).json(responseObject);
        } catch (error) {
            console.log(error);
        }
    });

    return function getBookingOrder(_x18, _x19) {
        return _ref13.apply(this, arguments);
    };
})();

let updateBookingOrder = exports.updateBookingOrder = (() => {
    var _ref14 = (0, _asyncToGenerator3.default)(function* (req, res) {
        try {

            let orderId = req.params.orderId;
            let orderType = req.body.orderType;

            let status = 'process';
            let column = 'running';
            let message = 'running';

            if (orderType === 'finish') {
                status = 'finish';
                column = 'finish';
                message = 'finish';
            }

            let currentTime = moment.tz('Asia/Kolkata').format();
            let currentDate = new Date(currentTime);
            let statusDateTime = currentDate.toUTCString();

            let updateResult = yield _Booking2.default.update({ id: orderId }, {
                status: status,
                column: column,
                statusDateTime: statusDateTime
            }).exec();

            if (updateResult) {
                if (updateResult.nModified === 1 || updateResult.n === 1) {

                    let sodPublishMessage = {
                        message: message,
                        data: {
                            id: orderId,
                            orderType: orderType,
                            status: status,
                            column: column,
                            statusDateTime: statusDateTime
                        }
                    };
                    yield (0, _index.socketPublishMessage)('SOD', sodPublishMessage);

                    let _singleLateBooking = yield _Booking2.default.findOne({ id: orderId }).exec();

                    //TODO send to teamMember
                    _singleLateBooking.teamWiseProductList.forEach((() => {
                        var _ref15 = (0, _asyncToGenerator3.default)(function* (singleTeamWiseProductList) {
                            yield (0, _index.socketPublishMessage)(singleTeamWiseProductList.id, sodPublishMessage);
                        });

                        return function (_x22) {
                            return _ref15.apply(this, arguments);
                        };
                    })());

                    res.status(200).json({ result: true });
                } else {
                    console.log(updateResult);
                }
            } else {
                console.log('contact to developer');
            }
        } catch (error) {
            console.log(error);
        }
    });

    return function updateBookingOrder(_x20, _x21) {
        return _ref14.apply(this, arguments);
    };
})();

let getTeamMemberBookingOrder = exports.getTeamMemberBookingOrder = (() => {
    var _ref16 = (0, _asyncToGenerator3.default)(function* (req, res) {
        try {

            let teamMemberId = req.params.teamMemberId;
            let startDayDateTime = moment().tz('Asia/Kolkata').startOf('day').format();
            let endDayDateTime = moment().tz('Asia/Kolkata').endOf('day').format();
            let NormalDateStartDateTime = new Date(startDayDateTime);
            let NormalDateEndDateTime = new Date(endDayDateTime);

            let responseObject = {
                runningOrder: [],
                runningLate: [],
                recentOrders: []
            };

            let recentOrders = yield _Booking2.default.find({
                status: 'waiting',
                bookingEndTime: {
                    $gte: NormalDateStartDateTime.toUTCString(),
                    $lte: NormalDateEndDateTime.toUTCString()
                },
                teamWiseProductList: {
                    $elemMatch: {
                        id: teamMemberId,
                        orderStatus: false
                    }
                }
            }).sort({ bookingStartTime: 1 }).exec();

            let runningOrders = yield _Booking2.default.find({
                status: 'process',
                bookingEndTime: {
                    $gte: NormalDateStartDateTime.toUTCString(),
                    $lte: NormalDateEndDateTime.toUTCString()
                },
                teamWiseProductList: {
                    $elemMatch: {
                        id: teamMemberId,
                        orderStatus: false
                    }
                }
            }).sort({ bookingStartTime: 1 }).exec();

            let lateOrders = yield _Booking2.default.find({
                status: 'late',
                bookingEndTime: {
                    $gte: NormalDateStartDateTime.toUTCString(),
                    $lte: NormalDateEndDateTime.toUTCString()
                },
                teamWiseProductList: {
                    $elemMatch: {
                        id: teamMemberId,
                        orderStatus: false
                    }
                }
            }).sort({ bookingStartTime: 1 }).exec();

            responseObject.recentOrders = recentOrders;
            responseObject.runningLate = lateOrders;
            responseObject.runningOrder = runningOrders;

            res.status(200).json(responseObject);
        } catch (error) {
            console.log(error);
        }
    });

    return function getTeamMemberBookingOrder(_x23, _x24) {
        return _ref16.apply(this, arguments);
    };
})();

var _Booking = require('./Booking.model');

var _Booking2 = _interopRequireDefault(_Booking);

var _TeamMemberProduct = require('../TeamMemberProduct/TeamMemberProduct.model');

var _TeamMemberProduct2 = _interopRequireDefault(_TeamMemberProduct);

var _Product = require('../Product/Product.model');

var _Product2 = _interopRequireDefault(_Product);

var _BookingItems = require('../BookingItems/BookingItems.model');

var _BookingItems2 = _interopRequireDefault(_BookingItems);

var _Team = require('../Team/Team.model');

var _Team2 = _interopRequireDefault(_Team);

var _commonHelper = require('../../config/commonHelper');

var _index = require('../Socket/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let moment = require('moment-timezone');
var _ = require('lodash');
//# sourceMappingURL=Booking.controller.js.map
