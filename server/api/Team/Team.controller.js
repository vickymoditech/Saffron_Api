import Team from './Team.model';
import TeamMemberProduct from '../TeamMemberProduct/TeamMemberProduct.model';
import {errorJsonResponse, getGuid, TeamImageUploadLocation} from '../../config/commonHelper';

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
    return Team.find({}, {_id: 0, __v: 0})
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

            if (Object.keys(files).length > 0 && fields.name && fields.description && isImage(files.filetoupload.name)) {
                let uuid = getGuid();
                let oldpath = files.filetoupload.path;
                let newpath = TeamImageUploadLocation.path + files.filetoupload.name;
                let dbpath = TeamImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = TeamImageUploadLocation.path + uuid + files.filetoupload.name;
                let name = fields.name.toLowerCase();
                let description = fields.description.toLowerCase();

                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        res.status(500)
                            .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                    } else {
                        fs.rename(newpath, renameFilePath, function (err) {
                            if (err) {
                                res.status(500).json(errorJsonResponse(err.toString(), "Fail to Rename file"));
                            } else {
                                let TeamNewAdd = new Team({
                                    id: getGuid(),
                                    image_url: dbpath,
                                    name: name,
                                    description: description,
                                    service_id: []
                                });
                                TeamNewAdd.save()
                                    .then(function (InsertTeam, err) {
                                        if (!err) {
                                            if (InsertTeam) {
                                                res.status(200)
                                                    .json({data: InsertTeam, result: "Save Successfully"});
                                            } else {
                                                res.status(400)
                                                    .json(errorJsonResponse("Error in db response", "Invalid_Image"));
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

                let errorMessage = "";
                if (Object.keys(files).length <= 0) {
                    errorMessage += "Team image is required.";
                } else if (!fields.name) {
                    errorMessage += "Team name is required.";
                } else if (!fields.description) {
                    errorMessage += "Team description is required.";
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

            if (fields.name && fields.description && fields.id) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {
                    let uuid = getGuid();
                    let oldpath = files.filetoupload.path;
                    let newpath = TeamImageUploadLocation.path + files.filetoupload.name;
                    let dbpath = TeamImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                    let renameFilePath = TeamImageUploadLocation.path + uuid + files.filetoupload.name;
                    let name = fields.name.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let id = fields.id;

                    let TeamObject = {
                        id,
                        image_url: dbpath,
                        name,
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
                                    Team.update({id: id}, {
                                        image_url: dbpath,
                                        name: name,
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

                    let name = fields.name.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let id = fields.id;

                    let TeamObject = {
                        id,
                        name,
                        description
                    };

                    Team.update({id: id}, {
                        name: name,
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
