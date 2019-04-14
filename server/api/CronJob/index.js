import Booking from '../Booking/Booking.model';
import {socketPublishMessage} from '../Socket/index';

let moment = require('moment-timezone');
var _ = require('lodash');

setInterval(async() => {
    try {

        let startDayDateTime = moment()
            .tz('Asia/Kolkata')
            .startOf('day')
            .format();
        let NormalDateStartDateTime = new Date(startDayDateTime);
        let currentTime = moment.tz('Asia/Kolkata')
            .format();
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

        await Promise.all(_LateBooking.map(async(singleBooking) => {
            let statusDateTime = currentDate.toUTCString();

            let updateResult = await Booking.update({id: singleBooking.id}, {
                status: 'late',
                column: 'running late',
                statusDateTime: statusDateTime
            })
                .exec();

            if(updateResult) {
                if(updateResult.nModified === 1 || updateResult.n === 1) {

                    let _singleLateBooking = _LateBooking.find((singleLateBooking) => singleLateBooking.id === singleBooking.id);

                    let sodPublishMessage = {
                        message: 'running late',
                        data: {
                            _id: _singleLateBooking._id,
                            id: _singleLateBooking.id,
                            customer_id: _singleLateBooking.customer_id,
                            customerName: _singleLateBooking.customerName,
                            basket: _singleLateBooking.basket,
                            teamWiseProductList: _singleLateBooking.teamWiseProductList,
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

                    //TODO send to teamMember
                    // _singleLateBooking.teamWiseProductList.forEach(async(singleTeamWiseProductList) => {
                    //     let _singleLateBookingClone = _.clone(_singleLateBooking);
                    //     _singleLateBookingClone.basket = singleTeamWiseProductList.productItem;
                    //     _singleLateBookingClone.status = 'late';
                    //     _singleLateBookingClone.column = 'running late';
                    //     _singleLateBookingClone.statusDateTime = statusDateTime;
                    //     //await socketPublishMessage(singleTeamWiseProductList.productTeam.id, _singleLateBookingClone);
                    // });

                } else {
                    console.log(updateResult);
                }
            } else {
                console.log('contact to developer');
            }

        }));

    } catch(error) {
        console.log(error);
    }

}, 10000);


