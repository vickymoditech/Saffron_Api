'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.index = index;
exports.deleteService = deleteService;
exports.addNewService = addNewService;
exports.updateService = updateService;
exports.testingPublishSocket = testingPublishSocket;

var _Service = require('./Service.model');

var _Service2 = _interopRequireDefault(_Service);

var _commonHelper = require('../../config/commonHelper');

var _Gallery = require('../Gallery/Gallery.model');

var _Gallery2 = _interopRequireDefault(_Gallery);

var _Product = require('../Product/Product.model');

var _Product2 = _interopRequireDefault(_Product);

var _TeamMemberProduct = require('../TeamMemberProduct/TeamMemberProduct.model');

var _TeamMemberProduct2 = _interopRequireDefault(_TeamMemberProduct);

var _Video = require('../Video/Video.model');

var _Video2 = _interopRequireDefault(_Video);

var _index = require('../Socket/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formidable = require('formidable');
var fs = require('fs');
var fs_extra = require('fs-extra');
const isImage = require('is-image');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            // res.writeHead(200, {'Content-Type': 'text/plain'});
            // res.end('Hello World\n');
            // return res;
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

// Gets a list of Services
function index(req, res) {
    return _Service2.default.find({}, { _id: 0, __v: 0 }).exec().then(respondWithResult(res, 200)).catch(handleError(res));
}

function deleteService(req, res, next) {
    try {
        if (req.params.serviceId) {
            let serviceId = req.params.serviceId;
            // delete all Gallery
            _Gallery2.default.remove({ service_id: serviceId }).exec(function (err, DeleteGallery) {
                if (!err) {
                    if (DeleteGallery) {

                        //delete all TeamMemberProduct
                        _Product2.default.find({ service_id: serviceId }).exec((err, listProductItems) => {

                            let productList = [];
                            listProductItems.forEach(product => {
                                productList.push(product.id);
                            });

                            //delete video
                            _Video2.default.remove({ serviceId: serviceId }).exec((err, deleteVideo) => {
                                if (deleteVideo) {
                                    _TeamMemberProduct2.default.remove({ product_id: { $in: productList } }).exec((err, deleteTeamMemberProduct) => {
                                        // delete all Product
                                        if (deleteTeamMemberProduct) {
                                            _Product2.default.remove({ service_id: serviceId }).exec(function (err, DeleteProduct) {
                                                if (!err) {
                                                    if (DeleteProduct) {
                                                        // Delete Service
                                                        _Service2.default.remove({ id: serviceId }).exec(function (err, DeleteService) {
                                                            if (!err) {
                                                                if (DeleteService) {
                                                                    if (DeleteService.result.n === 1) {
                                                                        res.status(200).json({
                                                                            id: serviceId,
                                                                            result: "Deleted Successfully"
                                                                        });
                                                                    } else {
                                                                        res.status(400).json((0, _commonHelper.errorJsonResponse)("service not found", "service not found"));
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        res.status(400).json((0, _commonHelper.errorJsonResponse)("Invalid Service", "Invalid Service"));
                    }
                } else {
                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                }
            });
        } else {
            res.status(400).json((0, _commonHelper.errorJsonResponse)("Id is required", "Id is required"));
        }
    } catch (error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(error, "Contact to your Developer"));
    }
}

function addNewService(req, res, next) {
    try {
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if ((0, _keys2.default)(files).length > 0 && fields.title && fields.description && fields.displayOrder && isImage(files.filetoupload.name)) {
                let uuid = (0, _commonHelper.getGuid)();
                let oldpath = files.filetoupload.path;
                let newpath = _commonHelper.serviceImageUploadLocation.path + files.filetoupload.name;
                let dbpath = _commonHelper.serviceImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = _commonHelper.serviceImageUploadLocation.path + uuid + files.filetoupload.name;
                let title = fields.title.toLowerCase();
                let description = fields.description.toLowerCase();
                let displayOrder = fields.displayOrder;

                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                    } else {
                        fs.rename(newpath, renameFilePath, function (err) {
                            if (err) {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                            } else {
                                let ServiceNewAdd = new _Service2.default({
                                    id: (0, _commonHelper.getGuid)(),
                                    image_url: dbpath,
                                    title: title,
                                    description: description,
                                    displayOrder: displayOrder,
                                    date: new Date().toISOString()
                                });
                                ServiceNewAdd.save().then(function (InsertService, err) {
                                    if (!err) {
                                        if (InsertService) {
                                            res.status(200).json({ data: InsertService, result: "Save Successfully" });
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
                    errorMessage += "Service image is required.";
                } else if (!fields.title) {
                    errorMessage += "Service title is required.";
                } else if (!fields.description) {
                    errorMessage += "Service description is required.";
                } else if (!fields.displayOrder) {
                    errorMessage += "Service displayOrder is required.";
                } else {
                    if (!isImage(files.filetoupload.name)) {
                        errorMessage += "only image is allowed.";
                    }
                }

                res.status(400).json((0, _commonHelper.errorJsonResponse)(errorMessage, errorMessage));
            }
        });
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), "Invalid Image"));
    }
}

function updateService(req, res, next) {
    try {
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            if (fields.title && fields.description && fields.id && fields.displayOrder) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {
                    let uuid = (0, _commonHelper.getGuid)();
                    let oldpath = files.filetoupload.path;
                    let newpath = _commonHelper.serviceImageUploadLocation.path + files.filetoupload.name;
                    let dbpath = _commonHelper.serviceImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                    let renameFilePath = _commonHelper.serviceImageUploadLocation.path + uuid + files.filetoupload.name;
                    let title = fields.title.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let displayOrder = fields.displayOrder;
                    let id = fields.id;

                    let serviceObject = {
                        id,
                        image_url: dbpath,
                        title,
                        description,
                        displayOrder
                    };

                    fs_extra.move(oldpath, newpath, function (err) {
                        if (err) {
                            res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Same Name Image Already Available On Server"));
                        } else {
                            fs.rename(newpath, renameFilePath, function (err) {
                                if (err) {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err.toString(), "Fail to Rename file"));
                                } else {
                                    _Service2.default.update({ id: id }, {
                                        image_url: dbpath,
                                        title: title,
                                        description: description,
                                        displayOrder: displayOrder
                                    }).exec(function (err, UpdateService) {
                                        if (!err) {
                                            if (UpdateService) {
                                                if (UpdateService.nModified === 1 || UpdateService.n === 1) {
                                                    res.status(200).json({
                                                        data: serviceObject,
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

                    let title = fields.title.toLowerCase();
                    let description = fields.description.toLowerCase();
                    let id = fields.id;
                    let displayOrder = fields.displayOrder;

                    let serviceObject = {
                        id,
                        title,
                        description,
                        displayOrder
                    };

                    _Service2.default.update({ id: id }, {
                        title: title,
                        description: description,
                        displayOrder: displayOrder
                    }).exec(function (err, UpdateService) {
                        if (!err) {
                            if (UpdateService) {
                                if (UpdateService.nModified === 1 || UpdateService.n === 1) {
                                    res.status(200).json({
                                        data: serviceObject,
                                        result: "updated Successfully "
                                    });
                                } else {
                                    res.status(403).json((0, _commonHelper.errorJsonResponse)("not found", "not found"));
                                }
                            } else {
                                res.status(404).json((0, _commonHelper.errorJsonResponse)("Invalid_Image", "Invalid_Image"));
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

function testingPublishSocket(req, res, next) {
    try {

        let requestObj = {
            message: req.body.message,
            data: req.body.data
        };

        (0, _index.socketPublishMessage)(requestObj.message, { data: requestObj.data }).then(response => {
            res.status(200).json({ result: response });
        });
    } catch (error) {
        console.log(error);
        console.log(error.message.toString());
        res.status(403).json({ result: error.message.toString() });
    }
}
//# sourceMappingURL=Service.controller.js.map
