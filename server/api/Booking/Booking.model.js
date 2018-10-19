import mongoose from 'mongoose';
import {registerEvents} from './Booking.events';

var BookingSchema = new mongoose.Schema({
    id: String,
    customer_id: String,
    total: Number,
    date: String,
    status: String
});

registerEvents(BookingSchema);
export default mongoose.model('Booking', BookingSchema);
