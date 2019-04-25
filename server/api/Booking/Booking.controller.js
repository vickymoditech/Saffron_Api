import Booking from './Booking.model';
import TeamMemberProduct from '../TeamMemberProduct/TeamMemberProduct.model';
import Product from '../Product/Product.model';
import BookingItems from '../BookingItems/BookingItems.model';
import Team from '../Team/Team.model';

import {jwtdata, errorJsonResponse, getGuid, setCache, getCache} from '../../config/commonHelper';
import {socketPublishMessage} from '../Socket/index';

let moment = require('moment-timezone');
var _ = require('lodash');

// New Booking
export async function index(req, res) {
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
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        let date = currentDate.getDate();
        let NormalStartDateTime = new Date(year, month, date, startTimeHours, startTimeMinutes, 0);
        let NormalEndDateTime = new Date(year, month, date, endTimeHours, endTimeMinutes, 0);
        let totalPrice = 0;
        let not_acceptAble = false;

        //Calculate the total time
        await Promise.all(bookingProduct.map(async (singleBookingProduct) => {
            let TeamMemberProductSingle = await getTeamMemberProductList(singleBookingProduct.product_id, singleBookingProduct.teamMember_id);

            let ProductItem = await getProduct(singleBookingProduct.product_id);

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

        }));

        if (!allProductFound) {
            let message = 'your order has been canceled, so please restart your application and place the booking again. we are sorry for this trouble.';
            res.status(400)
                .json(errorJsonResponse(message, message));
        } else {

            //check currentTime and booking selected time.
            if (currentDate.getTime() < NormalEndDateTime.getTime()) {

                let _LastBooking = await getLastBookingOrder(NormalStartDateTime, NormalEndDateTime);

                if (_LastBooking !== null && _LastBooking.visited === false) {

                    //Get Booking LastTime
                    let lastBookingDateTimeCalculation = moment.tz(_LastBooking.bookingEndTime, 'Asia/Kolkata')
                        .format();
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
                    if (!((NormalEndDateTime.getTime() >= addMinute.getTime()) && diffMinutes >= 0)) {
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
                    let BasketResponseGenerator = await BasketGenerator(bookingProduct);


                    let BookingAdd = new Booking({
                        id: getGuid(),
                        customer_id: userId,
                        basket: BasketResponseGenerator.basketResponse,
                        teamWiseProductList: BasketResponseGenerator.teamWiseProductList,
                        total: totalPrice,
                        bookingDateTime: new Date().toUTCString(),
                        bookingStartTime: bookingStartDateTime,
                        bookingEndTime: bookingEndDateTime,
                        status: 'waiting',
                        column: 'recent orders',
                        customerName: fullName,
                        visited: false,
                        statusDateTime: new Date().toUTCString()
                    });
                    BookingAdd.save()
                        .then(async function (InsertBooking, err) {
                            if (!err) {
                                if (InsertBooking) {
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
                                    await Promise.all(bookingProduct.map(async (singleBookingProduct) => {
                                        let BookingItemsAdd = new BookingItems({
                                            id: getGuid(),
                                            booking_id: InsertBooking.id,
                                            product_id: singleBookingProduct.product_id,
                                            team_id: singleBookingProduct.teamMember_id,
                                            active: true,
                                        });
                                        BookingItemsAdd.save()
                                            .then(async function (InsertBookingItems, err) {
                                                if (!err) {
                                                    if (!InsertBookingItems) {
                                                        res.status(400)
                                                            .json(errorJsonResponse('Error in db BookingItems response', 'Error in db BookingItems response'));
                                                    }
                                                } else {
                                                    res.status(400)
                                                        .json(errorJsonResponse(err, 'Contact to your Developer'));
                                                }
                                            });
                                    }));

                                    //ToDO send to TeamMember
                                    // BasketResponseGenerator.teamWiseProductList.map(async (singleObject) => {
                                    //     let copyResponse = _.clone(responseObject);
                                    //     copyResponse.productList = singleObject.productList;
                                    //     await socketPublishMessage(singleObject.id, copyResponse);
                                    // });

                                    let publishMessage = {
                                        message: 'new order',
                                        data: {
                                            _id: InsertBooking._id,
                                            id: InsertBooking.id,
                                            customer_id: InsertBooking.customer_id,
                                            customerName: fullName,
                                            basket: InsertBooking.basket,
                                            teamWiseProductList: BasketResponseGenerator.teamWiseProductList,
                                            total: InsertBooking.total,
                                            bookingDateTime: InsertBooking.bookingDateTime,
                                            bookingStartTime: InsertBooking.bookingStartTime,
                                            bookingEndTime: InsertBooking.bookingEndTime,
                                            status: InsertBooking.status,
                                            column: InsertBooking.column,
                                            statusDateTime: InsertBooking.statusDateTime,
                                        }
                                    };

                                    await socketPublishMessage('SOD', publishMessage);

                                    res.status(200)
                                        .json({
                                            totalTime,
                                            orderPlace: responseObject
                                        });

                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse('Error in db response', 'Error in db response'));
                                }
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse(err, 'Contact to your Developer'));
                            }
                        });
                } else {
                    res.status(406)
                        .json(errorJsonResponse('your order is not Accepted, please select another time slot and book your order', 'your order is not Accepted, please select another time slot and book your order'));
                }
            } else {
                let message = 'you have selected wrong time, please choose the valid time slot.';
                res.status(400)
                    .json(errorJsonResponse(message, message));
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function BasketGenerator(bookingProduct) {
    try {

        let basketResponse = [];
        let teamWiseProductList = [];

        await Promise.all(bookingProduct.map(async (bookingItem) => {

            let productItem = await getProduct(bookingItem.product_id);
            let productTeam = await getTeam(bookingItem.teamMember_id);
            let object = {
                productItem,
                productTeam
            };
            basketResponse.push(object);

            let teamMember = teamWiseProductList.find((teamMember) => teamMember.id === productTeam.id);
            if (!teamMember) {
                let pushData = {
                    id: productTeam.id,
                    productList: [],
                    orderStatus: false,
                };
                pushData.productList.push(productItem);
                teamWiseProductList.push(pushData);
            } else {
                teamMember.productList.push(productItem);
            }
        }));

        return {basketResponse, teamWiseProductList};

    } catch (error) {
        console.log(error);
        return error;
    }
}

async function getProduct(productId, index = 0) {
    let listProductList = getCache('productList');
    if (listProductList !== null) {
        let singleProduct = listProductList.find((product) => product.id === productId);
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
        listProductList = await Product.find({}, {_id: 0, __v: 0, description: 0, date: 0, sex: 0})
            .exec();
        setCache('productList', listProductList);
        return getProduct(productId, 1);
    }
}

async function getLastBookingOrder(NormalStartDateTime, NormalEndDateTime) {

    let _LastBookingOrder = await Booking.findOneAndUpdate({
        visited: false,
        bookingEndTime: {$gte: NormalStartDateTime.toUTCString(), $lte: NormalEndDateTime.toUTCString()}
    }, {$set: {visited: true}}, {sort: {bookingEndTime: -1}}).exec();

    if (_LastBookingOrder === null)
    //Todo should not be received null value
        return getLastBookingOrder(NormalStartDateTime, NormalEndDateTime);
    else if (_LastBookingOrder.visited === true)
        return getLastBookingOrder(NormalStartDateTime, NormalEndDateTime);
    else
        return _LastBookingOrder;
}

async function getTeam(teamId, index = 0) {
    let teamList = getCache('teamList');
    if (teamList !== null) {
        let singleTeam = teamList.find((team) => team.id === teamId);
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
        teamList = await Team.find({}, {_id: 0, __v: 0, description: 0})
            .exec();
        setCache('teamList', teamList);
        return getTeam(teamId, 1);
    }
}

async function getTeamMemberProductList(product_id, teamMember_id, index = 0) {
    let teamMemberProductList = getCache('teamMemberProductList');
    if (teamMemberProductList !== null) {
        let singleTeamMemberProduct = teamMemberProductList.find((teamMemberProduct) => teamMemberProduct.product_id === product_id && teamMember_id === teamMember_id);
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
        teamMemberProductList = await TeamMemberProduct.find()
            .exec();
        setCache('teamMemberProductList', teamMemberProductList);
        return getTeamMemberProductList(product_id, teamMember_id, 1);
    }
}

export async function getBookingOrder(req, res) {
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
            recentOrders: []
        };

        let recentOrders = await Booking.find({
            status: 'waiting',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        })
            .sort({bookingStartTime: 1})
            .exec();

        let runningOrders = await Booking.find({
            status: 'process',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        })
            .sort({bookingStartTime: 1})
            .exec();

        let lateOrders = await Booking.find({
            status: 'late',
            bookingEndTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: NormalDateEndDateTime.toUTCString()
            }
        })
            .sort({bookingStartTime: 1})
            .exec();

        responseObject.recentOrders = recentOrders;
        responseObject.runningLate = lateOrders;
        responseObject.runningOrder = runningOrders;

        res.status(200)
            .json(responseObject);

    } catch (error) {
        console.log(error);
    }
}

export async function updateBookingOrder(req, res) {
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

        let currentTime = moment.tz('Asia/Kolkata')
            .format();
        let currentDate = new Date(currentTime);
        let statusDateTime = currentDate.toUTCString();

        let updateResult = await Booking.update({id: orderId}, {
            status: status,
            column: column,
            statusDateTime: statusDateTime
        })
            .exec();

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
                await socketPublishMessage('SOD', sodPublishMessage);

                //TODO send to teamMember
                // _singleLateBooking.teamWiseProductList.forEach(async(singleTeamWiseProductList) => {
                //     let _singleLateBookingClone = _.clone(_singleLateBooking);
                //     _singleLateBookingClone.basket = singleTeamWiseProductList.productItem;
                //     _singleLateBookingClone.status = 'late';
                //     _singleLateBookingClone.column = 'running late';
                //     _singleLateBookingClone.statusDateTime = statusDateTime;
                //     //await socketPublishMessage(singleTeamWiseProductList.productTeam.id, _singleLateBookingClone);
                // });

                res.status(200)
                    .json();

            } else {
                console.log(updateResult);
            }
        } else {
            console.log('contact to developer');
        }

    } catch (error) {
        console.log(error);
    }
}

export async function getTeamMemberBookingOrder(req, res) {
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

        let recentOrders = await Booking.find({
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
        }).sort({bookingStartTime: 1}).exec();

        let runningOrders = await Booking.find({
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
        }).sort({bookingStartTime: 1}).exec();

        let lateOrders = await Booking.find({
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
        }).sort({bookingStartTime: 1}).exec();

        responseObject.recentOrders = recentOrders;
        responseObject.runningLate = lateOrders;
        responseObject.runningOrder = runningOrders;

        res.status(200)
            .json(responseObject);


    } catch (error) {
        console.log(error);
    }
}
