import mongoose from 'mongoose';
import {registerEvents} from './Gallery.events';

var GallerySchema = new mongoose.Schema({
    id: String,
    service_id: String,
    image_url: String,
    title: String,
    discription: Boolean,
    date: String,
    sex: String
});

registerEvents(GallerySchema);
export default mongoose.model('Gallery', GallerySchema);
