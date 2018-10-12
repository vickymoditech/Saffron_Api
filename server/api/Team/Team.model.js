import mongoose from 'mongoose';
import {registerEvents} from './Team.events';

var TeamSchema = new mongoose.Schema({
    id: String,
    name: String,
    image_url: String,
    description: String,
    product_id: [],
});

registerEvents(TeamSchema);
export default mongoose.model('Team', TeamSchema);
