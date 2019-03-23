import mongoose from 'mongoose';
import {registerEvents} from './BookingItems.events';

var BookingItemsSchema = new mongoose.Schema({
    id: String,
    booking_id: String,
    product_id: String,
    team_id: String,
    active: Boolean
});

registerEvents(BookingItemsSchema);
export default mongoose.model('BookingItems', BookingItemsSchema);
