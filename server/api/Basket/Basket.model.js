import mongoose from 'mongoose';
import {registerEvents} from './Basket.events';

var BasketSchema = new mongoose.Schema({
    id: String,
    items: [],
    createAt: {
        type: Date,
        default: Date.now(),
        index: {expires: 60 * 1}
    }
});

registerEvents(BasketSchema);
export default mongoose.model('Basket', BasketSchema);
