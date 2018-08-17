import Team from './Team.model';
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
    return Team.find()
        .exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function deleteTeam(req, res, next) {
    try {

        let check_field = true;
        let teamId;
        if (req.params.teamId) {
            teamId = req.params.teamId;
        } else {
            check_field = false;
            res.status(500)
                .json(errorJsonResponse('Id is required', 'Id is required'));
        }
        if (check_field) {
            Team.remove({id: teamId})
                .exec(function (err, DeleteTeam) {
                    if (!err) {
                        if (DeleteTeam) {
                            if (DeleteTeam.result.n === 1) {
                                res.status(200)
                                    .json({id: teamId, result: 'Deleted Successfully'});
                            } else {
                                res.status(403)
                                    .json({result: 'Deleted Fail'});
                            }

                        } else {
                            res.status(404)
                                .json(errorJsonResponse('Invalid Post', 'Invalid Post'));
                        }
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(err, 'Contact to your Developer'));
                    }
                });
        }
    } catch (error) {
        res.status(400)
            .json(errorJsonResponse(error, 'Contact to your Developer'));
    }
}

export function addNewTeam(req, res, next) {
    try {

        var form = new formidable.IncomingForm();
        let check_flow = true;
        form.parse(req, function (err, fields, files) {

            if (Object.keys(files).length > 0 && fields.name && fields.description && isImage(files.filetoupload.name)) {
                var oldpath = files.filetoupload.path;
                var newpath = TeamImageUploadLocation.path + files.filetoupload.name;
                var dbpath = TeamImageUploadLocation.dbpath + files.filetoupload.name;
                var name = fields.name.toLowerCase();
                var description = fields.description.toLowerCase();


                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        check_flow = false;
                        res.status(500)
                            .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                    }

                    if (check_flow) {

                        let TeamNewAdd = new Team({
                            id: getGuid(),
                            image_url: dbpath,
                            name: name,
                            description: description
                        });
                        TeamNewAdd.save()
                            .then(function (InsertTeam, err) {
                                if (!err) {
                                    if (InsertTeam) {
                                        res.status(200)
                                            .json({data: InsertTeam, result: "Save Successfully"});
                                    } else {
                                        res.status(404)
                                            .json(errorJsonResponse("Error in db response", "Invalid_Image"));
                                    }
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse(err, "Contact to your Developer"));
                                }
                            });
                    }
                })
            } else {
                res.status(400).json(errorJsonResponse("Invalid Request", "Invalid Request"));
            }
        });
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Image"));
    }
}

export function updateTeam(req, res, next) {
    try {
        var form = new formidable.IncomingForm();
        let check_flow = true;
        form.parse(req, function (err, fields, files) {

            if (fields.name && fields.description && fields.id) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {

                    var oldpath = files.filetoupload.path;
                    var newpath = TeamImageUploadLocation.path + files.filetoupload.name;
                    var dbpath = TeamImageUploadLocation.dbpath + files.filetoupload.name;
                    var name = fields.name.toLowerCase();
                    var description = fields.description.toLowerCase();
                    var id = fields.id;

                    let TeamObject = {
                        id,
                        image_url: dbpath,
                        name,
                        description
                    };

                    fs_extra.move(oldpath, newpath, function (err) {
                        if (err) {
                            check_flow = false;
                            res.status(500)
                                .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                        }

                        if (check_flow) {

                            Team.update({id: id}, {
                                image_url: dbpath,
                                name: name,
                                description: description
                            }).exec(function (err, UpdateTeam) {
                                if (!err) {
                                    if (UpdateTeam) {
                                        if (UpdateTeam.nModified === 1 && UpdateTeam.n === 1) {
                                            res.status(200)
                                                .json({
                                                    data: TeamObject,
                                                    result: "updated Successfully "
                                                });
                                        } else if (UpdateTeam.n === 1) {
                                            res.status(200)
                                                .json({result: "already updated"});
                                        } else {
                                            res.status(403)
                                                .json({result: "not found"});
                                        }

                                    } else {
                                        res.status(404)
                                            .json(errorJsonResponse("Invalid_Image", "Invalid_Image"));
                                    }
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse(err, "Contact to your Developer"));
                                }
                            });
                        }
                    })


                } else {

                    var name = fields.name.toLowerCase();
                    var description = fields.description.toLowerCase();
                    var id = fields.id;

                    let TeamObject = {
                        id,
                        name,
                        description
                    };

                    Team.update({id: id}, {
                        image_url: dbpath,
                        name: name,
                        description: description
                    }).exec(function (err, UpdateTeam) {
                        if (!err) {
                            if (UpdateTeam) {
                                if (UpdateTeam.nModified === 1 && UpdateTeam.n === 1) {
                                    res.status(200)
                                        .json({
                                            data: TeamObject,
                                            result: "updated Successfully "
                                        });
                                } else if (UpdateTeam.n === 1) {
                                    res.status(200)
                                        .json({result: "already updated"});
                                } else {
                                    res.status(403)
                                        .json({result: "not found"});
                                }

                            } else {
                                res.status(404)
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
