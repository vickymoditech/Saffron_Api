import Team from './Team.model';
import TeamMemberProduct from '../TeamMemberProduct/TeamMemberProduct.model';
import Oauth from '../oauth/oauth.model';
import {errorJsonResponse, getGuid, UserAvatarImageUploadLocation} from '../../config/commonHelper';

var formidable = require('formidable');
var fs = require('fs');
var fs_extra = require('fs-extra');
const isImage = require('is-image');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode)
                .json(entity);
        }
        return null;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode)
            .send(err);
    };
}

// Gets a list of Teams
export function index(req, res) {
    return Oauth.find({role: {$in: ['admin', 'employee']}}, {_id: 0, __v: 0, password: 0})
        .exec()
        .then(respondWithResult(res, 200))
        .catch(handleError(res));
}

export function deleteTeam(req, res, next) {
    try {
        if (req.params.teamId) {
            let teamId = req.params.teamId;

            //Remove all the TeamMemberProduct
            TeamMemberProduct.remove({teamMember_id: teamId}).exec((err, deleteTeamMember) => {
                if (deleteTeamMember) {
                    Team.remove({id: teamId})
                        .exec(function (err, DeleteTeam) {
                            if (!err) {
                                if (DeleteTeam) {
                                    if (DeleteTeam.result.n === 1) {
                                        res.status(200)
                                            .json({id: teamId, result: 'Deleted Successfully'});
                                    } else {
                                        res.status(400)
                                            .json({result: 'Deleted Fail'});
                                    }
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse('Invalid Post', 'Invalid Post'));
                                }
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse(err, 'Contact to your Developer'));
                            }
                        });
                }
            });
        } else {
            res.status(400)
                .json(errorJsonResponse('Id is required', 'Id is required'));
        }

    } catch (error) {
        res.status(400)
            .json(errorJsonResponse(error.message.toString(), 'Contact to your Developer'));
    }
}

export function addNewTeam(req, res, next) {
    try {

        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if (Object.keys(files).length > 0 && fields.first_name && fields.description && fields.mobile_number && fields.last_name && fields.email_id && fields.password && isImage(files.filetoupload.name)) {

                let uuid = getGuid();
                let oldpath = files.filetoupload.path;
                let newpath = UserAvatarImageUploadLocation.path + files.filetoupload.name;
                let dbpath = UserAvatarImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = UserAvatarImageUploadLocation.path + uuid + files.filetoupload.name;
                let first_name = fields.first_name.toLowerCase();
                let last_name = fields.last_name.toLowerCase();
                let mobile_number = fields.mobile_number.toLowerCase();
                let email_id = fields.email_id.toLowerCase();
                let description = fields.description.toLowerCase();
                let password = fields.password.toLowerCase();

                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        res.status(500)
                            .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                    } else {
                        fs.rename(newpath, renameFilePath, function (err) {
                            if (err) {
                                res.status(500).json(errorJsonResponse(err.toString(), "Fail to Rename file"));
                            } else {

                                let alreadyAvailable = false;
                                //check mobile number is already register or not
                                Oauth.findOne({userId: mobile_number}).exec(function (err, findUser) {

                                    if (findUser) {
                                        alreadyAvailable = true;
                                    }

                                    if (!alreadyAvailable) {
                                        let registrationUser = new Oauth({
                                            id: getGuid(),
                                            first_name: first_name,
                                            last_name: last_name,
                                            description: description,
                                            contact_no: mobile_number,
                                            email_id: email_id,
                                            userId: mobile_number,
                                            password: password,
                                            role: "employee",
                                            block: false,
                                            image_url: dbpath
                                        });
                                        registrationUser.save()
                                            .then(function (RegistrationSuccess, err) {
                                                if (!err) {
                                                    if (RegistrationSuccess) {
                                                        res.status(200)
                                                            .json({
                                                                data: RegistrationSuccess,
                                                                result: "Registration Successfully"
                                                            });
                                                    } else {
                                                        res.status(400)
                                                            .json(errorJsonResponse("Error in db response", "Invalid_Image"));
                                                    }
                                                } else {
                                                    res.status(400)
                                                        .json(errorJsonResponse(err, "Contact to your Developer"));
                                                }
                                            });

                                    } else {
                                        res.status(400).json(errorJsonResponse("Mobile number is already register", "Mobile number is already register"));
                                    }
                                });

                            }
                        });
                    }
                })
            } else {

                let errorMessage = "";
                if (Object.keys(files).length <= 0) {
                    errorMessage += "Team image is required.";
                } else if (!fields.first_name) {
                    errorMessage += "Team first name is required";
                } else if (!fields.last_name) {
                    errorMessage += "Team last name is required";
                } else if (!fields.mobile_number) {
                    errorMessage += "Team mobile number is required";
                } else if (!fields.password) {
                    errorMessage += "Team password is required";
                } else if (!fields.description) {
                    errorMessage += "Team description is required";
                } else {
                    if (!isImage(files.filetoupload.name)) {
                        errorMessage += "only image is allowed.";
                    }
                }
                res.status(400).json(errorJsonResponse(errorMessage, errorMessage));

            }
        });
    }
    catch (error) {
        res.status(400).json(errorJsonResponse(error.message.toString(), "Invalid Image"));
    }
}

export function updateTeam(req, res, next) {
    try {
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if (fields.first_name && fields.description && fields.last_name && fields.email_id && fields.id) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {

                    let uuid = getGuid();
                    let id = fields.id;
                    let oldpath = files.filetoupload.path;
                    let newpath = UserAvatarImageUploadLocation.path + files.filetoupload.name;
                    let dbpath = UserAvatarImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                    let renameFilePath = UserAvatarImageUploadLocation.path + uuid + files.filetoupload.name;
                    let first_name = fields.first_name.toLowerCase();
                    let last_name = fields.last_name.toLowerCase();
                    let email_id = fields.email_id.toLowerCase();
                    let description = fields.description.toLowerCase();

                    let TeamObject = {
                        id,
                        image_url: dbpath,
                        first_name,
                        last_name,
                        email_id,
                        description
                    };

                    fs_extra.move(oldpath, newpath, function (err) {
                        if (err) {
                            res.status(400)
                                .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                        }
                        else {
                            fs.rename(newpath, renameFilePath, function (err) {
                                if (err) {
                                    res.status(400).json(errorJsonResponse(err.toString(), "Fail to Rename file"));
                                } else {

                                    Oauth.update({id: id}, {
                                        image_url: dbpath,
                                        first_name: first_name,
                                        last_name: last_name,
                                        email_id: email_id,
                                        description: description
                                    }).exec(function (err, UpdateTeam) {
                                        if (!err) {
                                            if (UpdateTeam) {
                                                if (UpdateTeam.nModified === 1 || UpdateTeam.n === 1) {
                                                    res.status(200)
                                                        .json({
                                                            data: TeamObject,
                                                            result: "updated Successfully "
                                                        });
                                                } else {
                                                    res.status(400)
                                                        .json(errorJsonResponse("not found", "not found"));
                                                }

                                            } else {
                                                res.status(400)
                                                    .json(errorJsonResponse("Invalid_Image", "Invalid_Image"));
                                            }
                                        } else {
                                            res.status(400)
                                                .json(errorJsonResponse(err, "Contact to your Developer"));
                                        }
                                    });

                                }
                            });
                        }
                    })
                } else {

                    let description = fields.description.toLowerCase();
                    let first_name = fields.first_name.toLowerCase();
                    let last_name = fields.last_name.toLowerCase();
                    let email_id = fields.email_id.toLowerCase();
                    let id = fields.id;

                    let TeamObject = {
                        id,
                        first_name,
                        last_name,
                        email_id,
                        description
                    };

                    Oauth.update({id: id}, {
                        first_name: first_name,
                        last_name: last_name,
                        email_id: email_id,
                        description: description
                    }).exec(function (err, UpdateTeam) {
                        if (!err) {
                            if (UpdateTeam) {
                                if (UpdateTeam.nModified === 1 || UpdateTeam.n === 1) {
                                    res.status(200)
                                        .json({
                                            data: TeamObject,
                                            result: "updated Successfully "
                                        });
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse("not found", "not found"));
                                }

                            } else {
                                res.status(400)
                                    .json(errorJsonResponse("Invalid_Image", "Invalid_Image"));
                            }
                        } else {
                            res.status(400)
                                .json(errorJsonResponse(err, "Contact to your Developer"));
                        }
                    });
                }
            } else {
                res.status(400).json(errorJsonResponse("Invalid Request", "Invalid Request"));
            }
        });
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Image"));
    }
}
