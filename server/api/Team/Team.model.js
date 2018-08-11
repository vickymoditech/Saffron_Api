import mongoose from 'mongoose';
import {registerEvents} from './Team.events';

var TeamSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(TeamSchema);
export default mongoose.model('Team', TeamSchema);
