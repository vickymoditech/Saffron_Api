import mongoose from 'mongoose';
import {registerEvents} from './Basket.events';

var BasketSchema = new mongoose.Schema({
    id: String,
    items: []
});

BasketSchema.plugin(ttl, {ttl: (1000 * 60 * 7)});

registerEvents(BasketSchema);
export default mongoose.model('Basket', BasketSchema);
