import Booking from '../Booking/Booking.model';
import TimeSlot from '../TimeSlot/TimeSlot.model';
import {socketPublishMessage} from '../Socket/index';
import {getGuid} from '../../config/commonHelper';
import Log from '../../config/Log';

let moment = require('moment-timezone');
var _ = require('lodash');

//todo find running late orders
setInterval(async () => {
    try {

        let startDayDateTime = moment().tz('Asia/Kolkata').startOf('day').format();
        let NormalDateStartDateTime = new Date(startDayDateTime);
        let currentTime = moment.tz('Asia/Kolkata').format();
        let currentDate = new Date(currentTime);

        let _LateBooking = await Booking.find({
            status: 'waiting',
            column: 'recent orders',
            bookingStartTime: {
                $gte: NormalDateStartDateTime.toUTCString(),
                $lte: currentDate.toUTCString()
            }
        })
            .exec();

        await Promise.all(_LateBooking.map(async (singleBooking) => {
            let statusDateTime = currentDate.toUTCString();

            let updateResult = await Booking.update({id: singleBooking.id}, {
                status: 'late',
                column: 'running late',
                statusDateTime: statusDateTime
            })
                .exec();

            if (updateResult) {
                if (updateResult.nModified === 1 || updateResult.n === 1) {

                    let _singleLateBooking = _LateBooking.find((singleLateBooking) => singleLateBooking.id === singleBooking.id);

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
                    await socketPublishMessage('SOD', sodPublishMessage);

                    //ToDO send to TeamMember
                    _singleLateBooking.teamWiseProductList.map(async (singleObject) => {
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
                        await socketPublishMessage(singleObject.id, publishMessage);
                    });


                } else {
                    Log.writeLog(Log.eLogLevel.error, '[setInterval] : ' + JSON.stringify(updateResult));
                    console.log(updateResult);
                }
            } else {
                Log.writeLog(Log.eLogLevel.error, '[setInterval] : ' + JSON.stringify(errorMessage(updateResult,'contact to Developer')));
                console.log('contact to developer');
            }

        }));

    } catch (error) {
        Log.writeLog(Log.eLogLevel.error, '[setInterval] : ' + JSON.stringify(errorMessage(error.message.toString(),error.message.toString())));
        console.log(error);
    }

}, 10000);

setInterval(async () => {

    let currentTime = moment.tz('Asia/Kolkata').format();
    let currentDate = new Date(currentTime);
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    if (hours === 1 && minutes === 10) {
        TimeSlot.find({}, {__v: 0, _id: 0}).then(async (timeSlotList, err) => {
            if (!err) {

                timeSlotList.forEach(async (singleTimeSlot) => {
                    let split = singleTimeSlot.start_time.split(":");
                    let NormalStartDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), split[0], split[1], 0);
                    let BookingAdd = new Booking({
                        id: getGuid(),
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
                    await BookingAdd.save().then(async function (InsertBooking, err) {
                        if (!err) {
                            if (InsertBooking) {
                                Log.writeLog(Log.eLogLevel.info, '[setInterval] : ' + JSON.stringify("Save Successfully"));
                                console.log("Save successfully");
                            } else {
                                Log.writeLog(Log.eLogLevel.error, '[setInterval] : ' + JSON.stringify(errorMessage(InsertBooking,InsertBooking)));
                                console.log(InsertBooking);
                            }
                        } else {
                            Log.writeLog(Log.eLogLevel.error, '[setInterval] : ' + JSON.stringify(errorMessage(err.message.toString(),err.message.toString())));
                            console.log(err);
                        }
                    });
                });

            } else {
                Log.writeLog(Log.eLogLevel.error, '[setInterval] : ' + JSON.stringify(errorMessage(err.message.toString(),err.message.toString())));
                console.log(err);
            }
        });
    }

}, 60000);



