import mongoose from 'mongoose';
import {registerEvents} from './Booking.events';

var BookingSchema = new mongoose.Schema({
    id: String,
    customerId: String,
    basket: [],
    total: Number,
    bookingDate: Date,
    status: String,
    startDate: Date
});

registerEvents(BookingSchema);
export default mongoose.model('Booking', BookingSchema);
