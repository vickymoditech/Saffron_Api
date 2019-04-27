'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.index = index;
exports.addNewSliderImage = addNewSliderImage;
exports.deleteSliderImage = deleteSliderImage;

var _SliderImages = require('./SliderImages.model');

var _SliderImages2 = _interopRequireDefault(_SliderImages);

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

// Gets a list of SliderImagess
function index(req, res) {
    return _SliderImages2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Add New SliderImagess
function addNewSliderImage(req, res, next) {
    try {

        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if ((0, _keys2.default)(files).length > 0 && isImage(files.filetoupload.name)) {
                let uuid = (0, _commonHelper.getGuid)();
                let oldpath = files.filetoupload.path;
                let newpath = _commonHelper.SliderImageUploadLocation.path + files.filetoupload.name;
                let dbpath = _commonHelper.SliderImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = _commonHelper.SliderImageUploadLocation.path + uuid + files.filetoupload.name;

                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                    } else {
                        fs.rename(newpath, renameFilePath, function (err) {
                            if (err) {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                            } else {
                                let SliderImageNewAdd = new _SliderImages2.default({
                                    id: (0, _commonHelper.getGuid)(),
                                    image_url: dbpath
                                });
                                SliderImageNewAdd.save().then(function (InsertSlider, err) {
                                    if (!err) {
                                        if (InsertSlider) {
                                            res.status(200).json({
                                                data: InsertSlider,
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
                res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid Request", "Invalid Request"));
            }
        });
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), "Invalid Image"));
    }
}

function deleteSliderImage(req, res) {
    if (req.params.sliderImageId) {
        let sliderImageId = req.params.sliderImageId;
        _SliderImages2.default.remove({ id: sliderImageId }).exec(function (err, DeleteSliderImage) {
            if (!err) {
                if (DeleteSliderImage) {
                    if (DeleteSliderImage.result.n === 1) {
                        res.status(200).json({ id: sliderImageId, result: "Deleted Successfully" });
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
//# sourceMappingURL=SliderImages.controller.js.map
