import mongoose from 'mongoose';
import {registerEvents} from './BookingProduct.events';

var BookingProductSchema = new mongoose.Schema({
    id: String,
    timeSlot_id: String,
    time: String,
    date: String,
    status: String
});

registerEvents(BookingProductSchema);
export default mongoose.model('BookingProduct', BookingProductSchema);
