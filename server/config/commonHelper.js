const uuidv1 = require('uuid/v1');

export const jwtdata = {jwtSecretKey: '12334'};

var path  = __dirname.replace('config','');

export const imageUploadLocation = {path:path.replace(/\\/g,'/') + 'images/',dbpath:'images/'};

//error message response
export function errorJsonResponse(dev_msg,user_msg) {
    return {
        dev_msg: dev_msg,
        user_msg: user_msg
    }
}

export function getGuid() {
    return uuidv1();
}

