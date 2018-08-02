import mongoose from 'mongoose';
import {registerEvents} from './Service.events';

var ServiceSchema = new mongoose.Schema({
  id: String,
  title: String,
  image_url: String,
  discription: String,
});

registerEvents(ServiceSchema);
export default mongoose.model('Service', ServiceSchema);
