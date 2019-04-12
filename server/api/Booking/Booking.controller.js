import Booking from './Booking.model';
import TeamMemberProduct from '../TeamMemberProduct/TeamMemberProduct.model';
import Product from '../Product/Product.model';
import BookingItems from '../BookingItems/BookingItems.model';
import Team from '../Team/Team.model';

import {jwtdata, errorJsonResponse, getGuid, setCache, getCache} from '../../config/commonHelper';
import {socketPublishMessage} from '../Socket/index';

let moment = require('moment-timezone');
var _ = require('lodash');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

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
        let fullName = req.decoded.user.first_name + " " + req.decoded.user.last_name;
        let bookingStartDateTime = "";
        let bookingEndDateTime = "";
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        let date = currentDate.getDate();
        let NormalStartDateTime = new Date(year, month, date, startTimeHours, startTimeMinutes, 0);
        let NormalEndDateTime = new Date(year, month, date, endTimeHours, endTimeMinutes, 0);
        let totalPrice = 0;
        let not_accesptable = false;

        //Calculate the total time
        await Promise.all(bookingProduct.map(async (singleBookingProduct) => {
            let TeamMemberProductSingle = await getTeamMemberProductList(singleBookingProduct.product_id, singleBookingProduct.teamMember_id);

            let ProductItem = await getProduct(singleBookingProduct.product_id);

            if (ProductItem !== null)
                totalPrice += ProductItem.price;
            else
                allProductFound = false;

            if (TeamMemberProductSingle !== null) {
                totalTime += TeamMemberProductSingle.approxTime;
            } else {
                allProductFound = false;
            }

        }));

        if (!allProductFound) {
            let message = "your order has been canceled, so please restart your application and place the booking again. we are sorry for this trouble.";
            res.status(400).json(errorJsonResponse(message, message));
        } else {
            //check currentTime and booking selected time.
            if (currentDate.getTime() < NormalEndDateTime.getTime()) {
                let _LastBooking = await Booking.findOne({
                    bookingEndTime: {
                        $gte: NormalStartDateTime.toUTCString(),
                        $lte: NormalEndDateTime.toUTCString()
                    }
                }).sort({bookingEndTime: -1}).limit(1).exec();

                if (_LastBooking !== null) {

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
                        bookingStartDateTime = currentDate.toUTCString();
                        addMinute = currentDate;
                        addMinute.setMinutes(currentDate.getMinutes() + totalTime);
                        bookingEndDateTime = addMinute.toUTCString();
                    }

                    const diffTime = Math.abs(NormalEndDateTime.getTime() - addMinute.getTime());
                    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                    if (!((NormalEndDateTime.getTime() >= addMinute.getTime()) && diffMinutes >= 0)) {
                        not_accesptable = true;
                    }

                } else {

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

                if (!not_accesptable) {
                    //Generate the Basket Response.
                    let BasketResponseGenerator = await BasketGenerator(bookingProduct);


                    let BookingAdd = new Booking({
                        id: getGuid(),
                        customer_id: userId,
                        basket: BasketResponseGenerator.basketResponse,
                        total: totalPrice,
                        bookingDateTime: new Date().toUTCString(),
                        bookingStartTime: bookingStartDateTime,
                        bookingEndTime: bookingEndDateTime,
                        status: "New Order create",
                        statusDateTime: new Date().toUTCString()
                    });
                    BookingAdd.save()
                        .then(async function (InsertBooking, err) {
                            if (!err) {
                                if (InsertBooking) {
                                    let responseObject = {
                                        id: InsertBooking.id,
                                        customerId: InsertBooking.customer_id,
                                        customerName: fullName,
                                        productList: InsertBooking.basket,
                                        total: InsertBooking.total,
                                        bookingDateTime: moment.tz(InsertBooking.bookingDateTime, 'Asia/Kolkata').format(),
                                        arrivalTime: moment.tz(InsertBooking.bookingStartTime, 'Asia/Kolkata').format(),
                                        bookingEndTime: moment.tz(InsertBooking.bookingEndTime, 'Asia/Kolkata').format(),
                                        status: InsertBooking.status,
                                        statusDateTime: moment.tz(InsertBooking.statusDateTime, 'Asia/Kolkata').format(),
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
                                                            .json(errorJsonResponse("Error in db BookingItems response", "Error in db BookingItems response"));
                                                    }
                                                } else {
                                                    res.status(400)
                                                        .json(errorJsonResponse(err, "Contact to your Developer"));
                                                }
                                            });
                                    }));

                                    BasketResponseGenerator.teamWiseProductList.map(async (singleObject) => {
                                        let copyResponse = _.clone(responseObject);
                                        copyResponse.productList = singleObject.productList;
                                        await socketPublishMessage(singleObject.id, copyResponse);
                                    });

                                    await socketPublishMessage("SOD", responseObject);

                                    res.status(200).json({
                                        totalTime,
                                        orderPlace: responseObject
                                    });

                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse("Error in db response", "Error in db response"));
                                }
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse(err, "Contact to your Developer"));
                            }
                        });
                } else {
                    res.status(406).json(errorJsonResponse("your order is not Accepted, please select another time slot and book your order", "your order is not Accepted, please select another time slot and book your order"));
                }
            } else {
                let message = "you have selected wrong time, please choose the valid time slot.";
                res.status(400).json(errorJsonResponse(message, message));
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
        if (singleProduct)
            return singleProduct;
        else {
            if (index === 0)
                return getProduct(productId, 1);
            else
                return null;
        }
    } else {
        listProductList = await Product.find({}, {_id: 0, __v: 0, description: 0, date: 0, sex: 0}).exec();
        setCache('productList', listProductList);
        return getProduct(productId, 1);
    }
}

async function getTeam(teamId, index = 0) {
    let teamList = getCache('teamList');
    if (teamList !== null) {
        let singleTeam = teamList.find((team) => team.id === teamId);
        if (singleTeam)
            return singleTeam;
        else {
            if (index === 0)
                return getTeam(teamId, 1);
            else
                return null;
        }
    } else {
        teamList = await Team.find({}, {_id: 0, __v: 0, description: 0}).exec();
        setCache('teamList', teamList);
        return getTeam(teamId, 1);
    }
}

async function getTeamMemberProductList(product_id, teamMember_id, index = 0) {
    let teamMemberProductList = getCache('teamMemberProductList');
    if (teamMemberProductList !== null) {
        let singleTeamMemberProduct = teamMemberProductList.find((teamMemberProduct) => teamMemberProduct.product_id === product_id && teamMember_id === teamMember_id);
        if (singleTeamMemberProduct)
            return singleTeamMemberProduct;
        else {
            if (index === 0)
                return getTeamMemberProductList(product_id, teamMember_id, 1);
            else
                return null;
        }
    } else {
        teamMemberProductList = await TeamMemberProduct.find().exec();
        setCache('teamMemberProductList', teamMemberProductList);
        return getTeamMemberProductList(product_id, teamMember_id, 1);
    }
}


