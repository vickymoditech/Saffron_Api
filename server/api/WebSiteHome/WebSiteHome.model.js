'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './WebSiteHome.events';

var WebSiteHomeSchema = new mongoose.Schema({
    id: String,
    image_url: String,
    visible : Boolean,
});

registerEvents(WebSiteHomeSchema);
export default mongoose.model('WebSiteHome', WebSiteHomeSchema);
