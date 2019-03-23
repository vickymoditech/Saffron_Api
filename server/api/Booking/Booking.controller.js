import Booking from './Booking.model';
import TeamMemberProduct from '../TeamMemberProduct/TeamMemberProduct.model';
import {jwtdata, errorJsonResponse, getGuid} from '../../config/commonHelper';

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
        let startTime = req.body.startTime;
        let endTime = req.body.endTime;
        let bookingProduct = req.body.bookingProduct;
        let totalTime = 0;
        let allProductFound = true;
        let userId = req.decoded.user.userId;
        let bookingStartDateTime = "";
        let bookingEndDateTime = "";
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        let date = currentDate.getDate();
        let NormalStartDateTime = new Date(year, month, date, startTime, 0, 0);
        let NormalEndDateTime = new Date(year, month, date, endTime, 0, 0);

        //Calculate the total time
        await Promise.all(bookingProduct.map(async (singleBookingProduct) => {
            let TeamMemberProductSingle = await TeamMemberProduct.findOne({
                product_id: singleBookingProduct.product_id,
                teamMember_id: singleBookingProduct.teamMember_id
            }).exec();

            if (TeamMemberProductSingle) {
                totalTime += TeamMemberProductSingle.approxTime;
            } else {
                allProductFound = false;
            }
        }));

        if (!allProductFound) {
            let message = "your order has been canceled, so please restart your application and place the booking again. we are sorry for this trouble.";
            res.status(400).json(errorJsonResponse(message, message));
        } else {

            let _LastBooking = await Booking.findOne({
                bookingEndTime: {
                    $gte: NormalStartDateTime.toUTCString(),
                    $lt: NormalEndDateTime.toUTCString()
                }
            }).sort({bookingEndTime: -1}).limit(1).exec();

            if (_LastBooking !== null) {

                //Get Booking LastTime
                let lastBookingDateTimeCalculation = moment.tz(_LastBooking.bookingEndTime, 'Asia/Kolkata').format();
                let addMinute = new Date(lastBookingDateTimeCalculation);
                addMinute.setMinutes(addMinute.getMinutes() + totalTime);
                bookingStartDateTime = new Date(_LastBooking.bookingEndTime).toUTCString();
                bookingEndDateTime = addMinute.toUTCString();

            } else {
                //first order set stating time and add minutes and generate end time
                bookingStartDateTime = NormalStartDateTime.toUTCString();
                let addMinute = NormalStartDateTime;
                addMinute.setMinutes(NormalStartDateTime.getMinutes() + totalTime);
                bookingEndDateTime = addMinute.toUTCString();
            }

            let BookingAdd = new Booking({
                id: getGuid(),
                customer_id: userId,
                basket: {},
                total: 0,
                bookingDateTime: new Date().toUTCString(),
                bookingStartTime: bookingStartDateTime,
                bookingEndTime: bookingEndDateTime,
                status: "New Order create",
                statusDateTime: new Date().toUTCString()
            });
            BookingAdd.save()
                .then(function (InsertBooking, err) {
                    if (!err) {
                        if (InsertBooking) {
                            let responseObject = {
                                id: "bc9b95b0-4d56-11e9-840d-4bab3abe270f",
                                customer_id: InsertBooking.customer_id,
                                total: InsertBooking.total,
                                bookingDateTime: moment.tz(InsertBooking.bookingDateTime, 'Asia/Kolkata').format(),
                                arrivalTime: moment.tz(InsertBooking.bookingStartTime, 'Asia/Kolkata').format(),
                                bookingEndTime: moment.tz(InsertBooking.bookingEndTime, 'Asia/Kolkata').format(),
                                status: "New Order create",
                                statusDateTime: moment.tz(InsertBooking.statusDateTime, 'Asia/Kolkata').format(),
                                _id: InsertBooking._id
                            };

                            res.status(200).json({
                                total: totalTime,
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
        }
    } catch (error) {
        console.log(error);
    }
}
