import mongoose from 'mongoose';
import {registerEvents} from './Booking.events';

var BookingSchema = new mongoose.Schema({
    id: String,
    customer_id: Number,
    basket: mongoose.Schema.Types.Mixed,
    total: Number,
    bookingDateTime: Date,
    bookingStartTime: Date,
    bookingEndTime: Date,
    status: String,
    statusDateTime: Date
});

registerEvents(BookingSchema);
export default mongoose.model('Booking', BookingSchema);
