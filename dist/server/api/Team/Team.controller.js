'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.index = index;
exports.deleteTeam = deleteTeam;
exports.addNewTeam = addNewTeam;
exports.updateTeam = updateTeam;

var _Team = require('./Team.model');

var _Team2 = _interopRequireDefault(_Team);

var _TeamMemberProduct = require('../TeamMemberProduct/TeamMemberProduct.model');

var _TeamMemberProduct2 = _interopRequireDefault(_TeamMemberProduct);

var _commonHelper = require('../../config/commonHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formidable = require('formidable');
var fs = require('fs');
var fs_extra = require('fs-extra');
const isImage = require('is-image');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of Teams
function index(req, res) {
    return _Team2.default.find({}, { _id: 0, __v: 0 }).exec().then(respondWithResult(res, 200)).catch(handleError(res));
}

function deleteTeam(req, res, next) {
    try {
        if (req.params.teamId) {
            let teamId = req.params.teamId;

            //Remove all the TeamMemberProduct
            _TeamMemberProduct2.default.remove({ teamMember_id: teamId }).exec((err, deleteTeamMember) => {
                if (deleteTeamMember) {
                    _Team2.default.remove({ id: teamId }).exec(function (err, DeleteTeam) {
                        if (!err) {
                            if (DeleteTeam) {
                                if (DeleteTeam.result.n === 1) {
                                    res.status(200).json({ id: teamId, result: 'Deleted Successfully' });
                                } else {
                                    res.status(400).json({ result: 'Deleted Fail' });
                                }
                            } else {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)('Invalid Post', 'Invalid Post'));
                            }
                        } else {
                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err, 'Contact to your Developer'));
                        }
                    });
                }
            });
        } else {
            res.status(400).json((0, _commonHelper.errorJsonResponse)('Id is required', 'Id is required'));
        }
    } catch (error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(error.message.toString(), 'Contact to your Developer'));
    }
}

function addNewTeam(req, res, next) {
    try {

        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if ((0, _keys2.default)(files).length > 0 && fields.name && fields.description && isImage(files.filetoupload.name)) {
                let uuid = (0, _commonHelper.getGuid)();
                let oldpath = files.filetoupload.path;
                let newpath = _commonHelper.TeamImageUploadLocation.path + files.filetoupload.name;
                let dbpath = _commonHelper.TeamImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = _commonHelper.TeamImageUploadLocation.path + uuid + files.filetoupload.name;
                let name = fields.name.toLowerCase();
                let description = fields.description.toLowerCase();

                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        res.status(500).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                    } else {
                        fs.rename(newpath, renameFilePath, function (err) {
                            if (err) {
                                res.status(500).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                            } else {
                                let TeamNewAdd = new _Team2.default({
                                    id: (0, _commonHelper.getGuid)(),
                                    image_url: dbpath,
                                    name: name,
                                    description: description,
                                    service_id: []
                                });
                                TeamNewAdd.save().then(function (InsertTeam, err) {
                                    if (!err) {
                                        if (InsertTeam) {
                                            res.status(200).json({ data: InsertTeam, result: "Save Successfully" });
                                        } else {
                                            res.status(400).json((0, _commonHelper.errorJsonResponse)("Error in db response", "Invalid_Image"));
                                        }
                                    } else {
                                        res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                                    }
                                });
                            }
                        });
                    }
                });
            } else {

                let errorMessage = "";
                if ((0, _keys2.default)(files).length <= 0) {
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
                res.status(400).json((0, _commonHelper.errorJsonResponse)(errorMessage, errorMessage));
            }
        });
    } catch (error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(error.message.toString(), "Invalid Image"));
    }
}

function updateTeam(req, res, next) {
    try {
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if (fields.name && fields.description && fields.id) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {
                    let uuid = (0, _commonHelper.getGuid)();
                    let oldpath = files.filetoupload.path;
                    let newpath = _commonHelper.TeamImageUploadLocation.path + files.filetoupload.name;
                    let dbpath = _commonHelper.TeamImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                    let renameFilePath = _commonHelper.TeamImageUploadLocation.path + uuid + files.filetoupload.name;
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
                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                        } else {
                            fs.rename(newpath, renameFilePath, function (err) {
                                if (err) {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                                } else {
                                    _Team2.default.update({ id: id }, {
                                        image_url: dbpath,
                                        name: name,
                                        description: description
                                    }).exec(function (err, UpdateTeam) {
                                        if (!err) {
                                            if (UpdateTeam) {
                                                if (UpdateTeam.nModified === 1 || UpdateTeam.n === 1) {
                                                    res.status(200).json({
                                                        data: TeamObject,
                                                        result: "updated Successfully "
                                                    });
                                                } else {
                                                    res.status(400).json((0, _commonHelper.errorJsonResponse)("not found", "not found"));
                                                }
                                            } else {
                                                res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid_Image", "Invalid_Image"));
                                            }
                                        } else {
                                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {

                    let name = fields.name.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let id = fields.id;

                    let TeamObject = {
                        id,
                        name,
                        description
                    };

                    _Team2.default.update({ id: id }, {
                        name: name,
                        description: description
                    }).exec(function (err, UpdateTeam) {
                        if (!err) {
                            if (UpdateTeam) {
                                if (UpdateTeam.nModified === 1 || UpdateTeam.n === 1) {
                                    res.status(200).json({
                                        data: TeamObject,
                                        result: "updated Successfully "
                                    });
                                } else {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)("not found", "not found"));
                                }
                            } else {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid_Image", "Invalid_Image"));
                            }
                        } else {
                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                        }
                    });
                }
            } else {
                res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid Request", "Invalid Request"));
            }
        });
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), "Invalid Image"));
    }
}
//# sourceMappingURL=Team.controller.js.map
