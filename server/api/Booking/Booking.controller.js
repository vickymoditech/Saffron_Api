import Booking from './Booking.model';
import TeamMemberProduct from '../TeamMemberProduct/TeamMemberProduct.model';
import Product from '../Product/Product.model';
import BookingItems from '../BookingItems/BookingItems.model';
import Oauth from '../oauth/oauth.model';

import {jwtdata, errorJsonResponse, getGuid, setCache, getCache} from '../../config/commonHelper';
import {socketPublishMessage} from '../Socket/index';
import Log from '../../config/Log';

let moment = require('moment-timezone');
let _ = require('lodash');

// New Booking
export async function index(req, res) {
    let uniqueId = getGuid();
    try {
        let orderType = req.body.orderType;
        let startTimeHours = req.body.startTime.hours;
        let startTimeMinutes = req.body.startTime.minutes;
        let endTimeHours = req.body.endTime.hours;
        let endTimeMinutes = req.body.endTime.minutes;
        let bookingProduct = req.body.bookingProduct;
        let saffronPoint = req.body.saffronPoint;
        let totalTime = 0;
        let allProductFound = true;
        let userId = req.decoded.user.userId;
        let fullName = req.decoded.user.first_name + ' ' + req.decoded.user.last_name;
        let bookingStartDateTime = '';
        let bookingEndDateTime = '';
        let momentDateTime = moment()
            .tz('Asia/Kolkata')
            .format();
        let currentDate = new Date(momentDateTime);
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        let date = currentDate.getDate();
        let NormalStartDateTime = new Date(year, month, date, startTimeHours, startTimeMinutes, 0);
        let NormalEndDateTime = new Date(year, month, date, endTimeHours, endTimeMinutes, 0);
        let totalPrice = 0;
        let not_acceptAble = false;
        let extraTime = 0;

        switch (orderType) {
            case "10":
                extraTime = 10;
                break;
            case "15":
                extraTime = 15;
                break;
            default:
                extraTime = 0;
                break;
        }

        let requestObj = {
            startTimeHours,
            startTimeMinutes,
            endTimeHours,
            endTimeMinutes,
            bookingProduct,
            totalTime,
            allProductFound,
            userId,
            fullName,
            bookingStartDateTime,
            bookingEndDateTime,
            momentDateTime,
            currentDate,
            year,
            month,
            date,
            NormalStartDateTime,
            NormalEndDateTime,
            totalPrice,
            not_acceptAble,
        };

        Log.writeLog(Log.eLogLevel.info, '[POST:Bookings] : ' + JSON.stringify(requestObj), uniqueId);

        if(currentDate.getHours() >= 7) {

            //Calculate the total time
            await Promise.all(bookingProduct.map(async(singleBookingProduct) => {

                let TeamMemberProductSingle = await getTeamMemberProductList(singleBookingProduct.product_id, singleBookingProduct.teamMember_id, uniqueId);
                let ProductItem = await getProduct(singleBookingProduct.product_id, uniqueId);

                if(ProductItem !== null) {
                    totalPrice += ProductItem.price;
                } else {
                    allProductFound = false;
                }

                if(TeamMemberProductSingle !== null) {
                    totalTime += TeamMemberProductSingle.approxTime;
                } else {
                    allProductFound = false;
                }

            }));

            if(!allProductFound) {
                let message = 'your order has been canceled, so please restart your application and place the booking again. we are sorry for this trouble.';
                Log.writeLog(Log.eLogLevel.info, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(message, message)), uniqueId);
                res.status(400)
                    .json(errorJsonResponse(message, message));
            } else {

                //check currentTime and booking selected time.
                if(currentDate.getTime() < NormalEndDateTime.getTime()) {

                    //get LastBooking order
                    let _LastBooking = await getLastBookingOrder(NormalStartDateTime, NormalEndDateTime, uniqueId);

                    if(_LastBooking !== null && _LastBooking.visited === false) {

                        //Get Booking LastTime
                        let lastBookingDateTimeCalculation = moment.tz(_LastBooking.bookingEndTime, 'Asia/Kolkata').format();
                        let addMinute = new Date(lastBookingDateTimeCalculation);

                        // check Slot is empty if empty then it will set current time
                        if(currentDate.getTime() < addMinute.getTime() && (_LastBooking.status !== 'finish')) {

                            //Find differences
                            const diffTime = Math.abs(addMinute.getTime() - currentDate.getTime());
                            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                            let extraTimeToAdd = 0;

                            if(diffMinutes <= extraTime && extraTime !== 0)
                                extraTimeToAdd = Math.abs(extraTime - diffMinutes);

                            //set arrivalTime
                            const lastBookingDate  = new Date(lastBookingDateTimeCalculation);
                            lastBookingDate.setMinutes(lastBookingDate.getMinutes() + extraTimeToAdd);
                            bookingStartDateTime = lastBookingDate.toUTCString();
                            addMinute.setMinutes(lastBookingDate.getMinutes() + totalTime);
                            //set order finish time.
                            bookingEndDateTime = addMinute.toUTCString();

                        } else {
                            let currentTimeWithZeroMinutes = new Date(year, month, date, currentDate.getHours(), currentDate.getMinutes() + extraTime , 0);
                            addMinute = currentTimeWithZeroMinutes;
                            bookingStartDateTime = currentTimeWithZeroMinutes.toUTCString();
                            addMinute.setMinutes(currentTimeWithZeroMinutes.getMinutes() + totalTime);
                            bookingEndDateTime = addMinute.toUTCString();
                        }

                        const diffTime = Math.abs(NormalEndDateTime.getTime() - addMinute.getTime());
                        const diffMinutes = Math.ceil(diffTime / (1000 * 60));

                        if(!((NormalEndDateTime.getTime() >= addMinute.getTime()) && diffMinutes >= 0)) {

                            //check last order time and endTimeSlot time has less diff - 5
                            addMinute = new Date(lastBookingDateTimeCalculation);
                            const diffTimeActual = Math.abs(NormalEndDateTime.getTime() - addMinute.getTime());
                            const diffMinutesActual = Math.ceil(diffTimeActual / (1000 * 60));

                            if(diffMinutesActual > 5) {

                                await Booking.findOneAndUpdate({
                                    visited: true,
                                    timeSlotFull: false,
                                    bookingEndTime: {
                                        $gte: NormalStartDateTime.toUTCString(),
                                        $lte: NormalEndDateTime.toUTCString()
                                    }
                                }, {$set: {visited: false}}, {sort: {bookingEndTime: -1}})
                                    .exec();

                                throw new Error(`your selected time slot has been full for your order, you can remove some item from the basket and again place the order otherwise you can select another time slot for this order`);

                            } else {

                                await Booking.findOneAndUpdate({
                                    visited: true,
                                    timeSlotFull: false,
                                    bookingEndTime: {
                                        $gte: NormalStartDateTime.toUTCString(),
                                        $lte: NormalEndDateTime.toUTCString()
                                    }
                                }, {$set: {timeSlotFull: true}}, {sort: {bookingEndTime: -1}})
                                    .exec();

                                throw new Error('your selected time slot has been full please select another time slot and please order again');

                            }
                        }

                    } else {

                        //Never execute this part.
                        //first order set stating time and add minutes and generate end time
                        if(currentDate.getTime() < NormalStartDateTime.getTime()) {
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

                    if(!not_acceptAble) {

                        //Generate the Basket Response.
                        let BasketResponseGenerator = await BasketGenerator(bookingProduct, bookingStartDateTime, uniqueId);

                        //Todo write code here for apply saffron point.
                        //Todo check - 1 >=
                        //Todo minus and add.
                        if(saffronPoint) {
                            const UserPoints = await Oauth.findOne({userId: userId}, {saffronPoint: 1, _id: 0})
                                .exec();
                            console.log(UserPoints.saffronPoint);
                            if(UserPoints.saffronPoint > 0) {
                                if(UserPoints.saffronPoint <= totalPrice) {
                                    const calculate = totalPrice - UserPoints.saffronPoint;
                                    const saffronPointUse = await Oauth.update({contact_no: userId}, {$inc: {saffronPointUse: UserPoints.saffronPoint, saffronPoint: -(UserPoints.saffronPoint)}}).exec();
                                    if(saffronPointUse.nModified === 1) {
                                        totalPrice = calculate;
                                    }
                                } else {
                                    const saffronPointUse = await Oauth.update({contact_no: userId}, {$inc: {saffronPointUse: UserPoints.saffronPoint, saffronPoint: -(totalPrice)}}).exec();
                                    if(saffronPointUse.nModified === 1) {
                                        totalPrice = 0;
                                    }
                                }
                            }
                        }

                        let BookingAdd = new Booking({
                            id: getGuid(),
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
                            statusDateTime: bookingStartDateTime
                        });
                        BookingAdd.save()
                            .then(async function(InsertBooking, err) {
                                if(!err) {
                                    if(InsertBooking) {
                                        let responseObject = {
                                            id: InsertBooking.id,
                                            customer_id: InsertBooking.customer_id,
                                            customerName: fullName,
                                            productList: InsertBooking.basket,
                                            total: InsertBooking.total,
                                            bookingDateTime: moment.tz(InsertBooking.bookingDateTime, 'Asia/Kolkata')
                                                .format(),
                                            arrivalTime: moment.tz(InsertBooking.bookingStartTime, 'Asia/Kolkata')
                                                .format(),
                                            bookingEndTime: moment.tz(InsertBooking.bookingEndTime, 'Asia/Kolkata')
                                                .format(),
                                            status: InsertBooking.status,
                                            column: InsertBooking.column,
                                            statusDateTime: moment.tz(InsertBooking.statusDateTime, 'Asia/Kolkata')
                                                .format(),
                                            _id: InsertBooking._id
                                        };

                                        //ProductItemStore into BookingItem Collection.
                                        await Promise.all(bookingProduct.map(async(singleBookingProduct) => {
                                            let BookingItemsAdd = new BookingItems({
                                                id: getGuid(),
                                                booking_id: InsertBooking.id,
                                                product_id: singleBookingProduct.product_id,
                                                team_id: singleBookingProduct.teamMember_id,
                                                active: true,
                                            });
                                            BookingItemsAdd.save()
                                                .then(async function(InsertBookingItems, err) {
                                                    if(!err) {
                                                        if(!InsertBookingItems) {
                                                            Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(err.toString(), 'Error in db BookingItems response')), uniqueId);
                                                            res.status(400)
                                                                .json(errorJsonResponse('Error in db BookingItems response', 'Error in db BookingItems response'));
                                                        }
                                                    } else {
                                                        Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(err.toString(), 'Contact to your Developer')), uniqueId);
                                                        res.status(400)
                                                            .json(errorJsonResponse(err, 'Contact to your Developer'));
                                                    }
                                                });
                                        }));

                                        //ToDO send to SOD
                                        let publishMessage = {
                                            message: 'new order',
                                            data: {
                                                _id: InsertBooking._id,
                                                id: InsertBooking.id,
                                                customer_id: InsertBooking.customer_id,
                                                customerName: fullName,
                                                basket: InsertBooking.basket,
                                                total: InsertBooking.total,
                                                bookingDateTime: InsertBooking.bookingDateTime,
                                                bookingStartTime: InsertBooking.bookingStartTime,
                                                bookingEndTime: InsertBooking.bookingEndTime,
                                                status: InsertBooking.status,
                                                column: InsertBooking.column,
                                                statusDateTime: InsertBooking.statusDateTime,
                                                paymentComplete: InsertBooking.paymentComplete,
                                                paymentMemberId: InsertBooking.paymentMemberId,
                                                paymentMemberName: InsertBooking.paymentMemberName
                                            }
                                        };
                                        await socketPublishMessage('SOD', publishMessage);

                                        //ToDO send to TeamMember
                                        BasketResponseGenerator.teamWiseProductList.map(async(singleObject) => {
                                            let publishMessage = {
                                                message: 'new order',
                                                data: {
                                                    _id: InsertBooking._id,
                                                    id: InsertBooking.id,
                                                    customer_id: InsertBooking.customer_id,
                                                    customerName: fullName,
                                                    teamWiseProductList: BasketResponseGenerator.teamWiseProductList,
                                                    total: InsertBooking.total,
                                                    bookingDateTime: InsertBooking.bookingDateTime,
                                                    bookingStartTime: InsertBooking.bookingStartTime,
                                                    bookingEndTime: InsertBooking.bookingEndTime,
                                                    status: InsertBooking.status,
                                                    column: InsertBooking.column,
                                                    statusDateTime: InsertBooking.statusDateTime,
                                                    paymentComplete: InsertBooking.paymentComplete,
                                                    paymentMemberId: InsertBooking.paymentMemberId,
                                                    paymentMemberName: InsertBooking.paymentMemberName
                                                }
                                            };
                                            await socketPublishMessage(singleObject.id, publishMessage);
                                        });

                                        Log.writeLog(Log.eLogLevel.info, '[POST:Bookings] : ' + JSON.stringify({
                                            totalTime,
                                            orderPlace: responseObject
                                        }), uniqueId);
                                        res.status(200)
                                            .json({orderPlace: responseObject});

                                    } else {
                                        Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(InsertBooking, 'Error in db response')), uniqueId);
                                        res.status(400)
                                            .json(errorJsonResponse('Error in db response', 'Error in db response'));
                                    }
                                } else {
                                    Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(err.toString(), 'Error in db response')), uniqueId);
                                    res.status(400)
                                        .json(errorJsonResponse(err, 'Contact to your Developer'));
                                }
                            });
                    } else {

                        Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse('your order has not been Accepted, please select another time slot and book your order', 'your order has not been Accepted, please select another time slot and book your order')), uniqueId);
                        res.status(406)
                            .json(errorJsonResponse('your order has not been Accepted, please select another time slot and book your order', 'your order has not Accepted, please select another time slot and book your order'));

                    }
                } else {
                    let message = 'you have selected wrong time, please choose the valid time slot.';
                    Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(message, message)), uniqueId);
                    res.status(400)
                        .json(errorJsonResponse(message, message));
                }
            }

        } else {
            let message = 'Booking will be started at 7 am';
            Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(message, message)), uniqueId);
            res.status(400)
                .json(errorJsonResponse(message, message));
        }
    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, '[POST:Bookings] : ' + JSON.stringify(errorJsonResponse(error.message.toString(), error.message.toString())), uniqueId);
        res.status(400)
            .json(errorJsonResponse(error.message.toString(), error.message.toString()));
    }
}

async function BasketGenerator(bookingProduct, bookingStartDateTime, uniqueId) {
    try {

        let basketResponse = [];
        let teamWiseProductList = [];

        await Promise.all(bookingProduct.map(async(bookingItem) => {

            let productItem = await getProduct(bookingItem.product_id, uniqueId, true);
            let productTeam = await getTeam(bookingItem.teamMember_id, uniqueId);

            if(productItem && productTeam) {
                let object = {
                    productItem,
                    productTeam
                };
                basketResponse.push(object);

                let teamMember = teamWiseProductList.find((teamMember) => teamMember.id === productTeam.id);
                if(!teamMember) {
                    let pushData = {
                        id: productTeam.id,
                        productList: [],
                        orderStatus: 'waiting',
                        column: 'recent orders',
                        statusDateTime: bookingStartDateTime,
                        startTime: '',
                        endTime: ''
                    };
                    pushData.productList.push(productItem);
                    teamWiseProductList.push(pushData);
                } else {
                    teamMember.productList.push(productItem);
                }
            } else {
                throw new Error('you have passed wrong id for basket generation');
            }
        }));

        return {basketResponse, teamWiseProductList};

    } catch(error) {
        console.log(error);
        Log.writeLog(Log.eLogLevel.error, '[BasketGenerator] : ' + JSON.stringify(errorJsonResponse(error.message.toString(), error.message.toString())), uniqueId);
        throw new Error('you have passed wrong id for basket generation');
    }
}

async function getProduct(productId, uniqueId, count = false, index = 0) {
    let listProductList = getCache('productList');
    if(listProductList !== null) {
        let singleProduct = listProductList.find((product) => product.id === productId);
        if(singleProduct) {
            if(count) {
                await
                    Product.update({id: productId}, {$inc: {bookingValue: 1}})
                        .exec();
            }
            return singleProduct;
        } else {
            if(index === 0) {
                listProductList = await Product.find({}, {_id: 0, __v: 0, description: 0, date: 0, bookingValue: 0})
                    .exec();
                setCache('productList', listProductList);
                return getProduct(productId, uniqueId, count, 1);
            } else {
                Log.writeLog(Log.eLogLevel.error, `[getProduct] : Product not found = ${productId}`, uniqueId);
                return null;
            }
        }
    } else {
        listProductList = await Product.find({}, {_id: 0, __v: 0, description: 0, date: 0, bookingValue: 0})
            .exec();
        setCache('productList', listProductList);
        return getProduct(productId, uniqueId, count, 1);
    }
}

async function getLastBookingOrder(NormalStartDateTime, NormalEndDateTime, uniqueId) {

    let _LastBookingOrder = await Booking.findOneAndUpdate({
        visited: false,
        bookingEndTime: {$gte: NormalStartDateTime.toUTCString(), $lte: NormalEndDateTime.toUTCString()}
    }, {$set: {visited: true}}, {sort: {bookingEndTime: -1}})
        .exec();

    //Todo should not be received null value
    if(_LastBookingOrder === null) {
        Log.writeLog(Log.eLogLevel.error, '[getLastBookingOrder] : ' + JSON.stringify(errorJsonResponse(_LastBookingOrder, _LastBookingOrder)), uniqueId);

        let _LastBookingOrderAgain = await Booking.findOneAndUpdate({
            visited: true, timeSlotFull: true,
            bookingEndTime: {$gte: NormalStartDateTime.toUTCString(), $lte: NormalEndDateTime.toUTCString()}
        }, {sort: {bookingEndTime: -1}})
            .exec();

        if(_LastBookingOrderAgain) {
            throw new Error('your selected time slot has been full please select another time slot and please order again');
        } else {
            return getLastBookingOrder(NormalStartDateTime, NormalEndDateTime, uniqueId);
        }

    } else if(_LastBookingOrder.visited === true) {
        Log.writeLog(Log.eLogLevel.info, '[getLastBookingOrder-true] : ' + JSON.stringify(errorJsonResponse(_LastBookingOrder, _LastBookingOrder)), uniqueId);
        return getLastBookingOrder(NormalStartDateTime, NormalEndDateTime, uniqueId);
    } else {
        Log.writeLog(Log.eLogLevel.info, '[getLastBookingOrder] : ' + JSON.stringify(errorJsonResponse(_LastBookingOrder, _LastBookingOrder)), uniqueId);
        return _LastBookingOrder;
    }
}

async function getTeam(teamId, uniqueId, index = 0) {
    let teamList = getCache('teamLists');
    if(teamList !== null) {
        let singleTeam = teamList.find((team) => team.id === teamId);
        if(singleTeam) {
            return singleTeam;
        } else {
            if(index === 0) {
                teamList = await Oauth.find({role: 'employee'}, {
                    _id: 0,
                    __v: 0,
                    description: 0,
                    userId: 0,
                    password: 0,
                    role: 0,
                    block: 0
                })
                    .exec();
                setCache('teamLists', teamList);
                return getTeam(teamId, uniqueId, 1);
            } else {
                Log.writeLog(Log.eLogLevel.error, `[getTeam] : TeamMember not found = ${teamId}`, uniqueId);
                return null;
            }
        }
    } else {
        teamList = await Oauth.find({role: 'employee'}, {
            _id: 0,
            __v: 0,
            description: 0,
            userId: 0,
            password: 0,
            role: 0,
            block: 0
        })
            .exec();
        setCache('teamLists', teamList);
        return getTeam(teamId, uniqueId, 1);
    }
}

async function getTeamMemberProductList(product_id, teamMember_id, uniqueId, index = 0) {
    let teamMemberProductList = getCache('teamMemberProductList');
    if(teamMemberProductList !== null) {
        let singleTeamMemberProduct = teamMemberProductList.find((teamMemberProduct) => teamMemberProduct.product_id === product_id && teamMemberProduct.teamMember_id === teamMember_id);
        if(singleTeamMemberProduct) {
            return singleTeamMemberProduct;
        } else {
            if(index === 0) {
                teamMemberProductList = await TeamMemberProduct.find()
                    .exec();
                setCache('teamMemberProductList', teamMemberProductList);
                return getTeamMemberProductList(product_id, teamMember_id, uniqueId, 1);
            } else {
                Log.writeLog(Log.eLogLevel.error, `[getTeamMemberProductList] : Record not found ProductId = ${product_id}  teamId = ${teamMember_id}`, uniqueId);
                return null;
            }
        }
    } else {
        teamMemberProductList = await TeamMemberProduct.find()
            .exec();
        setCache('teamMemberProductList', teamMemberProductList);
        return getTeamMemberProductList(product_id, teamMember_id, uniqueId, 1);
    }
}

export async function getBookingOrder(req, res) {
    let uniqueId = getGuid();
    try {
        let startDayDateTime = moment()
            .tz('Asia/Kolkata')
            .startOf('day')
            .format();
        let endDayDateTime = moment()
            .tz('Asia/Kolkata')
            .endOf('day')
            .format();
        let NormalDateStartDateTime = new Date(startDayDateTime);
        let NormalDateEndDateTime = new Date(endDayDateTime);

        let responseObject = {
            runningOrder: [],
            runningLate: [],
            recentOrders: [],
            recentComplete: []
        };

        let recentOrders = await Booking.find({
            status: 'waiting',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        }, {teamWiseProductList: 0})
            .sort({bookingStartTime: 1})
            .exec();

        let runningOrders = await Booking.find({
            status: 'process',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        }, {teamWiseProductList: 0})
            .sort({bookingStartTime: 1})
            .exec();

        let lateOrders = await Booking.find({
            status: 'late',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        }, {teamWiseProductList: 0})
            .sort({bookingStartTime: 1})
            .exec();

        let recentComplete = await Booking.find({
            status: 'finish',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        }, {teamWiseProductList: 0})
            .sort({bookingStartTime: 1})
            .exec();


        responseObject.recentOrders = recentOrders;
        responseObject.runningLate = lateOrders;
        responseObject.runningOrder = runningOrders;
        responseObject.recentComplete = recentComplete;

        Log.writeLog(Log.eLogLevel.info, '[getBookingOrder] : ' + JSON.stringify(responseObject), uniqueId);
        res.status(200)
            .json(responseObject);

    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, '[getBookingOrder] : ' + JSON.stringify(errorJsonResponse(error.message.toString(), error.message.toString())), uniqueId);
        console.log(error);
    }
}

export async function updateBookingOrder(req, res) {
    let uniqueId = getGuid();
    try {

        const orderId = req.params.orderId;
        const paymentMemberId = req.decoded.user.id;
        const paymentMemberName = req.decoded.user.first_name + ' ' + req.decoded.user.last_name;
        let orderType = req.body.orderType;

        if(orderType === 'payment finish') {

            const message = 'payment finish';

            const updateResult = await Booking.findOneAndUpdate({id: orderId}, {
                paymentComplete: true,
                paymentMemberId: paymentMemberId,
                paymentMemberName: paymentMemberName
            })
                .exec();


            if(updateResult) {

                //Todo send push notification and Add Saffron Point here
                await Oauth.update({contact_no: updateResult.customer_id}, {$inc: {saffronPoint: 5}})
                    .exec();

                let sodPublishMessage = {
                    message: message,
                    data: {
                        id: orderId,
                        paymentComplete: true,
                        paymentMemberId: paymentMemberId,
                        paymentMemberName: paymentMemberName
                    }
                };
                await socketPublishMessage('SOD', sodPublishMessage);
                let _singleLateBooking = await Booking.findOne({id: orderId})
                    .exec();

                //TODO send to teamMember
                _singleLateBooking.teamWiseProductList.forEach(async(singleTeamWiseProductList) => {
                    await socketPublishMessage(singleTeamWiseProductList.id, sodPublishMessage);
                });
                Log.writeLog(Log.eLogLevel.info, '[updateBookingOrder] : ' + JSON.stringify({result: true}), uniqueId);
                res.status(200)
                    .json({result: true});

            } else {
                Log.writeLog(Log.eLogLevel.error, '[updateBookingOrder] : ' + JSON.stringify(errorJsonResponse(updateResult, {result: false})), uniqueId);
                console.log(updateResult);
            }
        } else {
            Log.writeLog(Log.eLogLevel.error, '[updateBookingOrder] : ' + JSON.stringify(errorJsonResponse('contact to developer', {result: false})), uniqueId);
            res.status(200)
                .json({result: false});
        }

    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, '[updateBookingOrder] : ' + JSON.stringify(errorJsonResponse(error.message.toString(), error.message.toString())), uniqueId);
        console.log(error);
    }
}

export async function updateBookingEmployeeOrder(req, res, next) {
    let uniqueId = getGuid();
    try {

        let orderId = req.params.orderId;
        let teamMemberId = req.params.teamMemberId;
        let orderType = req.body.orderType;

        let currentTime = moment.tz('Asia/Kolkata')
            .format();
        let currentDate = new Date(currentTime);
        let statusDateTime = currentDate.toUTCString();

        let status = 'process';
        let column = 'running';
        let message = 'running';

        if(orderType === 'finish') {
            status = 'finish';
            column = 'finish';
            message = 'finish';
        }


        //Todo update innerData for TeamMember orderstatus,startTime,orderstatusTime
        let updateResultTeamMember = null;
        if(orderType === 'finish') {
            updateResultTeamMember = await Booking.update({id: orderId, 'teamWiseProductList.id': teamMemberId}, {
                $set: {
                    'teamWiseProductList.$.orderStatus': status,
                    'teamWiseProductList.$.column': column,
                    'teamWiseProductList.$.statusDateTime': statusDateTime,
                    'teamWiseProductList.$.endTime': statusDateTime,
                }
            });
        } else {
            updateResultTeamMember = await Booking.update({id: orderId, 'teamWiseProductList.id': teamMemberId}, {
                $set: {
                    'teamWiseProductList.$.orderStatus': status,
                    'teamWiseProductList.$.column': column,
                    'teamWiseProductList.$.statusDateTime': statusDateTime,
                    'teamWiseProductList.$.startTime': statusDateTime,
                }
            });
        }

        if(updateResultTeamMember) {

            if(updateResultTeamMember.nModified > 0 || updateResultTeamMember.n > 0) {

                if(orderType !== 'finish') {
                    let updateResult = await Booking.update({id: orderId, column: {$ne: column}}, {
                        status: status,
                        column: column,
                        statusDateTime: statusDateTime
                    })
                        .exec();

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

                    if(updateResult.nModified > 0 || updateResult.n > 0) {
                        await socketPublishMessage('SOD', sodPublishMessage);
                        Log.writeLog(Log.eLogLevel.info, '[updateBookingOrderSOD] : ' + JSON.stringify({result: true}), uniqueId);
                    }

                    await socketPublishMessage(teamMemberId, sodPublishMessage);
                    Log.writeLog(Log.eLogLevel.info, '[updateBookingOrderTeamMember] : ' + JSON.stringify({result: true}), uniqueId);
                    res.status(200)
                        .json({result: true});
                } else {

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

                    let findResult = await Booking.find({
                        id: orderId,
                        'teamWiseProductList.orderStatus': 'waiting'
                    })
                        .exec();

                    let findResult1 = await Booking.find({
                        id: orderId,
                        'teamWiseProductList.orderStatus': 'process'
                    })
                        .exec();

                    let findResult2 = await Booking.find({
                        id: orderId,
                        'teamWiseProductList.orderStatus': 'late'
                    })
                        .exec();

                    if(!((findResult.length > 0) || (findResult1.length > 0) || (findResult2.length > 0))) {

                        let updateResult = await Booking.update({id: orderId}, {
                            status: status,
                            column: column,
                            statusDateTime: statusDateTime
                        })
                            .exec();

                        if(updateResult.nModified > 0 || updateResult.n > 0) {
                            await socketPublishMessage('SOD', sodPublishMessage);
                            Log.writeLog(Log.eLogLevel.info, '[updateBookingOrderSOD] : ' + JSON.stringify({result: true}), uniqueId);
                        } else {
                            Log.writeLog(Log.eLogLevel.error, '[updateBookingOrderSOD] : ' + JSON.stringify(updateResult), uniqueId);
                            res.status(200)
                                .json({result: false});
                        }
                    }

                    await socketPublishMessage(teamMemberId, sodPublishMessage);
                    Log.writeLog(Log.eLogLevel.info, '[updateBookingOrderTeamMember] : ' + JSON.stringify({result: true}), uniqueId);
                    res.status(200)
                        .json({result: true});
                }

            } else {
                Log.writeLog(Log.eLogLevel.error, '[updateBookingOrder] : ' + JSON.stringify(errorJsonResponse('contact to developer', {result: false})), uniqueId);
                res.status(200)
                    .json({result: false});
            }
        } else {
            res.status(200)
                .json({result: false});
        }

    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, '[updateBookingOrder] : ' + JSON.stringify(errorJsonResponse(error.message.toString(), error.message.toString())), uniqueId);
        console.log(error);
    }
}

export async function getTeamMemberBookingOrder(req, res) {
    let uniqueId = getGuid();
    try {

        let teamMemberId = req.params.teamMemberId;
        let startDayDateTime = moment()
            .tz('Asia/Kolkata')
            .startOf('day')
            .format();
        let endDayDateTime = moment()
            .tz('Asia/Kolkata')
            .endOf('day')
            .format();
        let NormalDateStartDateTime = new Date(startDayDateTime);
        let NormalDateEndDateTime = new Date(endDayDateTime);

        let responseObject = {
            runningOrder: [],
            runningLate: [],
            recentOrders: [],
            recentComplete: []
        };

        let recentOrders = await Booking.find({
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            },
            teamWiseProductList: {
                $elemMatch: {
                    id: teamMemberId,
                    orderStatus: 'waiting'
                }
            }
        }, {basket: 0})
            .sort({bookingStartTime: 1})
            .exec();

        let runningOrders = await Booking.find({
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            },
            teamWiseProductList: {
                $elemMatch: {
                    id: teamMemberId,
                    orderStatus: 'process'
                }
            }
        }, {basket: 0})
            .sort({bookingStartTime: 1})
            .exec();

        let lateOrders = await Booking.find({
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            },
            teamWiseProductList: {
                $elemMatch: {
                    id: teamMemberId,
                    orderStatus: 'late'
                }
            }
        }, {basket: 0})
            .sort({bookingStartTime: 1})
            .exec();

        let recentComplete = await Booking.find({
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            },
            teamWiseProductList: {
                $elemMatch: {
                    id: teamMemberId,
                    orderStatus: 'finish'
                }
            }
        }, {basket: 0})
            .sort({bookingStartTime: 1})
            .exec();


        responseObject.recentOrders = recentOrders;
        responseObject.runningLate = lateOrders;
        responseObject.runningOrder = runningOrders;
        responseObject.recentComplete = recentComplete;

        Log.writeLog(Log.eLogLevel.info, '[getTeamMemberBookingOrder] : ' + JSON.stringify(responseObject), uniqueId);
        res.status(200)
            .json(responseObject);


    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, '[getTeamMemberBookingOrder] : ' + JSON.stringify(errorJsonResponse(error.message.toString(), error.message.toString())), uniqueId);
        console.log(error);
    }
}
