'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.index = index;
exports.allGallery = allGallery;
exports.deleteGallery = deleteGallery;
exports.addNewGallery = addNewGallery;
exports.updateGallery = updateGallery;

var _Gallery = require('./Gallery.model');

var _Gallery2 = _interopRequireDefault(_Gallery);

var _Service = require('../Service/Service.model');

var _Service2 = _interopRequireDefault(_Service);

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

// Gets a list of Gallery
function index(req, res) {
    return _Gallery2.default.find({}, { _id: 0, __v: 0 }).sort({ date: -1 }).limit(9).exec().then(respondWithResult(res, 200)).catch(handleError(res));
}

// Gets all the Gallery
function allGallery(req, res) {
    if (req.params.serviceId) {
        return _Gallery2.default.find({ service_id: req.params.serviceId }, { _id: 0, __v: 0 }).sort({ date: -1 }).exec().then(respondWithResult(res, 200)).catch(handleError(res));
    }
}

function deleteGallery(req, res) {
    if (req.params.galleryId) {
        let galleryId = req.params.galleryId;
        _Gallery2.default.remove({ id: galleryId }).exec(function (err, DeleteGallery) {
            if (!err) {
                if (DeleteGallery) {
                    if (DeleteGallery.result.n === 1) {
                        res.status(200).json({ id: galleryId, result: "Deleted Successfully" });
                    } else {
                        res.status(400).json((0, _commonHelper.errorJsonResponse)("Deleted Fail", "Deleted Fail"));
                    }
                } else {
                    res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid Post", "Invalid Post"));
                }
            } else {
                res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
            }
        });
    } else {
        res.status(400).json((0, _commonHelper.errorJsonResponse)("Id is required", "Id is required"));
    }
}

function addNewGallery(req, res, next) {
    try {

        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if ((0, _keys2.default)(files).length > 0 && fields.title && fields.description && fields.service_id && fields.sex && isImage(files.filetoupload.name)) {
                let uuid = (0, _commonHelper.getGuid)();
                let oldpath = files.filetoupload.path;
                let newpath = _commonHelper.GalleryImageUploadLocation.path + files.filetoupload.name;
                let dbpath = _commonHelper.GalleryImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = _commonHelper.GalleryImageUploadLocation.path + uuid + files.filetoupload.name;
                let service_id = fields.service_id;
                let title = fields.title.toLowerCase();
                let description = fields.description.toLowerCase();
                let sex = fields.sex.toLowerCase();

                _Service2.default.findOne({ id: service_id }).exec(function (err, findService) {
                    if (findService) {
                        fs_extra.move(oldpath, newpath, function (err) {
                            if (err) {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                            } else {
                                fs.rename(newpath, renameFilePath, function (err) {
                                    if (err) {
                                        res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                                    } else {
                                        let GalleryNewAdd = new _Gallery2.default({
                                            id: (0, _commonHelper.getGuid)(),
                                            service_id: service_id,
                                            image_url: dbpath,
                                            title: title,
                                            description: description,
                                            date: new Date().toISOString(),
                                            sex: sex
                                        });
                                        GalleryNewAdd.save().then(function (InsertService, err) {
                                            if (!err) {
                                                if (InsertService) {
                                                    res.status(200).json({
                                                        data: InsertService,
                                                        result: "Save Successfully"
                                                    });
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
                        res.status(400).json((0, _commonHelper.errorJsonResponse)("Service Not Found ", "Service Not Found"));
                    }
                });
            } else {
                res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid Request", "Invalid Request"));
            }
        });
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), "Invalid Image"));
    }
}

function updateGallery(req, res, next) {
    try {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if (fields.title && fields.description && fields.service_id && fields.sex && fields.id) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {
                    let uuid = (0, _commonHelper.getGuid)();
                    let oldpath = files.filetoupload.path;
                    let newpath = _commonHelper.GalleryImageUploadLocation.path + files.filetoupload.name;
                    let dbpath = _commonHelper.GalleryImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                    let renameFilePath = _commonHelper.GalleryImageUploadLocation.path + uuid + files.filetoupload.name;
                    let service_id = fields.service_id;
                    let id = fields.id;
                    let title = fields.title.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let sex = fields.sex.toLowerCase();

                    let response = {
                        id,
                        service_id,
                        image_url: dbpath,
                        title,
                        description,
                        sex
                    };

                    _Service2.default.findOne({ id: service_id }).exec(function (err, findService) {
                        if (findService) {
                            fs_extra.move(oldpath, newpath, function (err) {
                                if (err) {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                                } else {
                                    fs.rename(newpath, renameFilePath, function (err) {
                                        if (err) {
                                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                                        } else {

                                            _Gallery2.default.update({ id: id }, {
                                                service_id: service_id,
                                                image_url: dbpath,
                                                title: title,
                                                description: description,
                                                date: new Date().toISOString(),
                                                sex: sex
                                            }).exec(function (err, UpdateGallery) {
                                                if (!err) {
                                                    if (UpdateGallery) {
                                                        if (UpdateGallery.nModified === 1 || UpdateGallery.n === 1) {

                                                            res.status(200).json({
                                                                data: response,
                                                                result: "updated Successfully "
                                                            });
                                                        } else {
                                                            res.status(400).json((0, _commonHelper.errorJsonResponse)("Record not found", "Record not found"));
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
                            res.status(400).json((0, _commonHelper.errorJsonResponse)("Service Not Found ", "Service Not Found"));
                        }
                    });
                } else {

                    let service_id = fields.service_id;
                    let id = fields.id;
                    let title = fields.title.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let sex = fields.sex.toLowerCase();

                    let response = {
                        id,
                        service_id,
                        title,
                        description,
                        sex
                    };

                    _Service2.default.findOne({ id: service_id }).exec(function (err, findService) {
                        if (findService) {
                            _Gallery2.default.update({ id: id }, {
                                service_id: service_id,
                                title: title,
                                description: description,
                                sex: sex
                            }).exec(function (err, UpdateGallery) {
                                if (!err) {
                                    if (UpdateGallery) {
                                        if (UpdateGallery.nModified === 1 || UpdateGallery.n === 1) {
                                            res.status(200).json({
                                                data: response,
                                                result: "updated Successfully "
                                            });
                                        } else {
                                            res.status(400).json((0, _commonHelper.errorJsonResponse)("Record not found", "Record not found"));
                                        }
                                    } else {
                                        res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid_Image", "Invalid_Image"));
                                    }
                                } else {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                                }
                            });
                        } else {
                            res.status(400).json((0, _commonHelper.errorJsonResponse)("Service Not Found ", "Service Not Found"));
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
//# sourceMappingURL=Gallery.controller.js.map
