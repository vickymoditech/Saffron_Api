import mongoose from 'mongoose';
import {registerEvents} from './Booking.events';

var BookingSchema = new mongoose.Schema({
    id: String,
    customer_id: Number,
    basket: mongoose.Schema.Types.Mixed,
    teamWiseProductList: mongoose.Schema.Types.Mixed,
    total: Number,
    bookingDateTime: Date,
    bookingStartTime: Date,
    bookingEndTime: Date,
    status: String,
    column: String,
    customerName: String,
    visited: Boolean,
    timeSlotFull: {type: Boolean, default: false},
    statusDateTime: Date
});

registerEvents(BookingSchema);
export default mongoose.model('Booking', BookingSchema);
