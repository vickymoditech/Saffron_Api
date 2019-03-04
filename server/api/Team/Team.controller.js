import Team from './Team.model';
import {errorJsonResponse, getGuid, TeamImageUploadLocation} from '../../config/commonHelper';
import Product from '../Product/Product.model';

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

export function addTeamService(req, res, next) {
    try {
        if (req.body) {

            let id = req.body.id;
            let product_id = req.body.product_id;
            let TeamObject = {
                id,
                product_id
            };

            try {
                Product.find({id: product_id}).exec(function (err, findProduct) {
                    if (findProduct.length > 0) {
                        Team.update({id: id}, {
                            $push: {
                                product_id: product_id
                            }
                        }).exec(function (err, UpdateTeam) {
                            if (!err) {
                                if (UpdateTeam) {
                                    if (UpdateTeam.nModified === 1 || UpdateTeam.n === 1) {
                                        res.status(200)
                                            .json({
                                                data: TeamObject,
                                                result: "Successfully Add new service"
                                            });
                                    } else {
                                        res.status(400)
                                            .json(errorJsonResponse("not found Team Member", "not found Team Member"));
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
                    else {
                        res.status(400).json(errorJsonResponse("Product is not found", "Product is not found"));
                    }
                });
            }
            catch
                (error) {
                res.status(400).json(errorJsonResponse(error, "contact to developer"))
            }
        }
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Request"));
    }
}

export function removeTeamService(req, res, next) {
    try {
        if (req.body) {

            let id = req.body.id;
            let product_id = req.body.product_id;
            let TeamObject = {
                id,
                product_id
            };

            try {
                Product.find({id: product_id}).exec(function (err, findService) {
                    if (findService.length > 0) {
                        Team.update({id: id}, {
                            $pull: {
                                product_id: product_id
                            }
                        }).exec(function (err, UpdateTeam) {
                            if (!err) {
                                if (UpdateTeam) {
                                    if (UpdateTeam.nModified === 1 || UpdateTeam.n === 1) {
                                        res.status(200)
                                            .json({
                                                data: TeamObject,
                                                result: "Successfully Remove Product"
                                            });
                                    } else {
                                        res.status(403)
                                            .json(errorJsonResponse("not found Team Member", "not found Team Member"));
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
                    else {
                        res.status(403).json(errorJsonResponse("Service is not found", "Service is not found"));
                    }
                });
            }
            catch
                (error) {
                res.status(501).json(errorJsonResponse(error, "contact to developer"))
            }
        }
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Request"));
    }
}

export function teamMemberProductsList(req, res, next) {
    try {
        if (req.params.teamMemberId) {
            let teamMemberId = req.params.teamMemberId;

            Team.findOne({id: teamMemberId}).exec(function (err, team) {
                if (!err) {
                    return Product.find({
                        id: {
                            $in: team.product_id
                        }
                    }).exec(function (err, product) {
                        res.status(200).json(product);
                    })
                } else {
                    res.status(400)
                        .json(errorJsonResponse(err, "Contact to your Developer"));
                }
            });
        } else {
            res.status(400)
                .json(errorJsonResponse("Team Member Id is required", "Team Member Id is required"));
        }
    } catch (error) {
        res.status(400).json(errorJsonResponse(error, "Contact to your Developer"));
    }
}
