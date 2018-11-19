import Gallery from './Gallery.model';
import Service from '../Service/Service.model';
import {errorJsonResponse, GalleryImageUploadLocation, getGuid} from '../../config/commonHelper';

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

// Gets a list of Gallerys
export function index(req, res) {
    return Gallery.find({}, {_id: 0, __v: 0}).sort({date: -1}).limit(9).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function deleteGallery(req, res) {
    if (req.params.galleryId) {
        let galleryId = req.params.galleryId;
        Gallery.remove({id: galleryId})
            .exec(function (err, DeleteGallery) {
                if (!err) {
                    if (DeleteGallery) {
                        if (DeleteGallery.result.n === 1) {
                            res.status(200)
                                .json({id: galleryId, result: "Deleted Successfully"});
                        } else {
                            res.status(403)
                                .json({result: "Deleted Fail"});
                        }

                    } else {
                        res.status(404)
                            .json(errorJsonResponse("Invalid Post", "Invalid Post"));
                    }
                } else {
                    res.status(400)
                        .json(errorJsonResponse(err, "Contact to your Developer"));
                }
            });
    } else {
        res.status(500)
            .json(errorJsonResponse("Id is required", "Id is required"));
    }
}

export function addNewGallery(req, res, next) {
    try {

        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (Object.keys(files).length > 0 && fields.title && fields.description && fields.service_id && fields.sex && isImage(files.filetoupload.name)) {
                let uuid = getGuid();
                let oldpath = files.filetoupload.path;
                let newpath = GalleryImageUploadLocation.path + files.filetoupload.name;
                let dbpath = GalleryImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = GalleryImageUploadLocation.path + uuid + files.filetoupload.name;
                let service_id = fields.service_id;
                let title = fields.title.toLowerCase();
                let description = fields.description.toLowerCase();
                let sex = fields.sex.toLowerCase();

                Service.findOne({id: service_id}).exec(function (err, findService) {
                    if (findService) {
                        fs_extra.move(oldpath, newpath, function (err) {
                            if (err) {
                                res.status(500)
                                    .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                            } else {
                                fs.rename(newpath, renameFilePath, function (err) {
                                    if (err) {
                                        res.status(500).json(errorJsonResponse(err.toString(), "Fail to Rename file"));
                                    } else {
                                        let GalleryNewAdd = new Gallery({
                                            id: getGuid(),
                                            service_id: service_id,
                                            image_url: dbpath,
                                            title: title,
                                            description: description,
                                            date: new Date().toISOString(),
                                            sex: sex
                                        });
                                        GalleryNewAdd.save()
                                            .then(function (InsertService, err) {
                                                if (!err) {
                                                    if (InsertService) {
                                                        res.status(200)
                                                            .json({
                                                                data: InsertService,
                                                                result: "Save Successfully"
                                                            });
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
                                });
                            }
                        });
                    } else {
                        res.status(500)
                            .json(errorJsonResponse("Service Not Found ", "Service Not Found"));
                    }
                });
            } else {
                res.status(400).json(errorJsonResponse("Invalid Request", "Invalid Request"));
            }
        });
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Image"));
    }
}

export function updateGallery(req, res, next) {
    try {
        var form = new formidable.IncomingForm();
        let check_flow = true;
        form.parse(req, function (err, fields, files) {

            if (fields.title && fields.description && fields.service_id && fields.sex && fields.id) {

                if (files.filetoupload && isImage(files.filetoupload.name)) {
                    let uuid = getGuid();
                    let oldpath = files.filetoupload.path;
                    let newpath = GalleryImageUploadLocation.path + files.filetoupload.name;
                    let dbpath = GalleryImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                    let renameFilePath = GalleryImageUploadLocation.path + uuid + files.filetoupload.name;
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

                    Service.findOne({id: service_id}).exec(function (err, findService) {
                        if (findService) {
                            fs_extra.move(oldpath, newpath, function (err) {
                                if (err) {
                                    check_flow = false;
                                    res.status(500)
                                        .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                                } else {
                                    fs.rename(newpath, renameFilePath, function (err) {
                                        if (err) {
                                            res.status(500).json(errorJsonResponse(err.toString(), "Fail to Rename file"));
                                        } else {

                                            Gallery.update({id: id}, {
                                                service_id: service_id,
                                                image_url: dbpath,
                                                title: title,
                                                description: description,
                                                date: new Date().toISOString(),
                                                sex: sex
                                            }).exec(function (err, UpdateGallery) {
                                                if (!err) {
                                                    if (UpdateGallery) {
                                                        if (UpdateGallery.nModified === 1 && UpdateGallery.n === 1) {

                                                            res.status(200)
                                                                .json({
                                                                    data: response,
                                                                    result: "updated Successfully "
                                                                });

                                                        } else if (UpdateGallery.n === 1) {
                                                            res.status(200)
                                                                .json({result: "already updated"});
                                                        } else {
                                                            res.status(403)
                                                                .json({result: "Record not found"});
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
                                    });
                                }
                            });
                        } else {
                            check_flow = false;
                            res.status(500)
                                .json(errorJsonResponse("Service Not Found ", "Service Not Found"));
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


                    Service.findOne({id: service_id}).exec(function (err, findService) {
                        if (findService) {
                            Gallery.update({id: id}, {
                                service_id: service_id,
                                title: title,
                                description: description,
                                sex: sex
                            }).exec(function (err, UpdateGallery) {
                                if (!err) {
                                    if (UpdateGallery) {
                                        if (UpdateGallery.nModified === 1 && UpdateGallery.n === 1) {
                                            res.status(200)
                                                .json({
                                                    data: response,
                                                    result: "updated Successfully "
                                                });

                                        } else if (UpdateGallery.n === 1) {
                                            res.status(200)
                                                .json({result: "already updated"});
                                        } else {
                                            res.status(403)
                                                .json({result: "Record not found"});
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
                        } else {
                            check_flow = false;
                            res.status(500)
                                .json(errorJsonResponse("Service Not Found ", "Service Not Found"));
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
