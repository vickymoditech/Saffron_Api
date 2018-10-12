import mongoose from 'mongoose';
import {registerEvents} from './Product.events';

let ProductSchema = new mongoose.Schema({
    id: String,
    service_id: String,
    price: Number,
    offerPrice: Number,
    title: String,
    description: String,
    date: String,
    sex: String
});

registerEvents(ProductSchema);
export default mongoose.model('Product', ProductSchema);