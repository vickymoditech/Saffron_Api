import mongoose from 'mongoose';
import {registerEvents} from './TimeSlot.events';

var TimeSlotSchema = new mongoose.Schema({
    product_id: String,
    team_id: String,
    times: []
});

registerEvents(TimeSlotSchema);
export default mongoose.model('TimeSlot', TimeSlotSchema);
