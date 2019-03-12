import mongoose from 'mongoose';
import {registerEvents} from './BookingItems.events';

var BookingItemsSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(BookingItemsSchema);
export default mongoose.model('BookingItems', BookingItemsSchema);
