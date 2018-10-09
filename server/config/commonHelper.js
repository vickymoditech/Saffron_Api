const uuidv1 = require('uuid/v1');

export const jwtdata = {jwtSecretKey: '12334'};

var path  = __dirname.replace('config','');


export const imageUploadLocation = {path:path.replace(/\\/g,'/') + 'images/',dbpath:'images/'};
export const serviceImageUploadLocation = {path:path.replace(/\\/g,'/') + 'images/service/',dbpath:'images/service/'};
export const GalleryImageUploadLocation = {path:path.replace(/\\/g,'/') + 'images/Gallery/',dbpath:'images/Gallery/'};
export const TeamImageUploadLocation = {path:path.replace(/\\/g,'/') + 'images/Team/',dbpath:'images/Team/'};
export const UserAvatarImageUploadLocation = {path:path.replace(/\\/g,'/') + 'images/UserAvatar/',dbpath:'images/UserAvatar/'};

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

