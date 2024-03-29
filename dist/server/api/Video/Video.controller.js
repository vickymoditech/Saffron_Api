'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.allVideos = allVideos;
exports.deleteVideo = deleteVideo;
exports.addNewVideo = addNewVideo;
exports.updateGallery = updateGallery;

var _Video = require('./Video.model');

var _Video2 = _interopRequireDefault(_Video);

var _Service = require('../Service/Service.model');

var _Service2 = _interopRequireDefault(_Service);

var _commonHelper = require('../../config/commonHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

// Gets all the Videos
function allVideos(req, res) {
    if (req.params.serviceId) {
        return _Video2.default.find({ service_id: req.params.serviceId }, { _id: 0, __v: 0 }).sort({ date: -1 }).exec().then(respondWithResult(res, 200)).catch(handleError(res));
    }
}

function deleteVideo(req, res) {
    if (req.params.videoId) {
        let videoId = req.params.videoId;
        _Video2.default.remove({ id: videoId }).exec(function (err, DeleteVideo) {
            if (!err) {
                if (DeleteVideo) {
                    if (DeleteVideo.result.n === 1) {
                        res.status(200).json({ id: videoId, result: "Deleted Successfully" });
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

function addNewVideo(req, res, next) {
    try {

        let request = {
            service_id: req.body.service_id,
            video_url: req.body.video_url,
            title: req.body.title,
            description: req.body.description,
            sex: req.body.sex
        };

        _Service2.default.findOne({ id: request.service_id }).exec(function (err, findService) {
            if (findService) {
                let VideoNewAdd = new _Video2.default({
                    id: (0, _commonHelper.getGuid)(),
                    service_id: request.service_id,
                    video_url: request.video_url,
                    title: request.title,
                    description: request.description,
                    date: new Date().toISOString(),
                    sex: request.sex
                });
                VideoNewAdd.save().then(function (InsertService, err) {
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
            } else {
                res.status(400).json((0, _commonHelper.errorJsonResponse)("Service Not Found ", "Service Not Found"));
            }
        });
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), Error.toString()));
    }
}

function updateGallery(req, res, next) {
    try {

        let request = {
            id: req.body.id,
            service_id: req.body.service_id,
            video_url: req.body.video_url,
            title: req.body.title,
            description: req.body.description,
            sex: req.body.sex
        };

        _Service2.default.findOne({ id: request.service_id }).exec(function (err, findService) {
            if (findService) {
                _Video2.default.update({ id: request.id }, {
                    service_id: request.service_id,
                    image_url: request.dbpath,
                    title: request.title,
                    description: request.description,
                    date: new Date().toISOString(),
                    sex: request.sex
                }).exec(function (err, UpdateVideo) {
                    if (!err) {
                        if (UpdateVideo) {
                            if (UpdateVideo.nModified === 1 || UpdateVideo.n === 1) {

                                res.status(200).json({
                                    data: request,
                                    result: "updated Successfully "
                                });
                            } else {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)("Record not found", "Record not found"));
                            }
                        } else {
                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                        }
                    } else {
                        res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                    }
                });
            } else {
                res.status(400).json((0, _commonHelper.errorJsonResponse)("Service Not Found ", "Service Not Found"));
            }
        });
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), Error.toString()));
    }
}
//# sourceMappingURL=Video.controller.js.map
