import mongoose from 'mongoose';
import {registerEvents} from './coupon.events';

var CouponSchema = new mongoose.Schema({
    id: String,
    name: String,
    info: String,
    percentage: Number,
    minPrice: Number,
    maxPrice: Number,
    maxDiscount:Number,
    startDate: Date,
    endDate: Date,
    userId: [String]
});

registerEvents(CouponSchema);
export default mongoose.model('Coupon', CouponSchema);
