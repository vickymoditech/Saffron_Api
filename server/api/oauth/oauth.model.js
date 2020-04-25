'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './oauth.events';

var OauthSchema = new mongoose.Schema({
    id: String,
    first_name: String,
    last_name: String,
    description: String,
    contact_no: Number,
    email_id: String,
    userId: String,
    password: String,
    role: String,
    saffronPoint: {
        type: Number,
        default: 0
    },
    saffronPointUse: {
        type: Number,
        default: 0
    },
    registerDevice: [String],
    block: Boolean,
    image_url: String,
    isAuthenticate: Boolean,
    otp: Number
});

registerEvents(OauthSchema);
export default mongoose.model('login', OauthSchema);
