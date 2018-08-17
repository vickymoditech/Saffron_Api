/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/Gallerys              ->  index
 * POST    /api/Gallerys              ->  create
 * GET     /api/Gallerys/:id          ->  show
 * PUT     /api/Gallerys/:id          ->  upsert
 * PATCH   /api/Gallerys/:id          ->  patch
 * DELETE  /api/Gallerys/:id          ->  destroy
 */

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
    return Gallery.find().sort({date: -1}).limit(8).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function deleteGallery(req, res) {
    //console.log(req.decoded);
    let check_field = true;
    let galleryId;
    if (req.params.galleryId) {
        galleryId = req.params.galleryId;
    } else {
        check_field = false;
        res.status(500)
            .json(errorJsonResponse("Id is required", "Id is required"));
    }

    if (check_field) {
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
    }
}

export function addNewGallery(req, res, next) {
    try {
        var form = new formidable.IncomingForm();
        let check_flow = true;
        form.parse(req, function (err, fields, files) {

            if (Object.keys(files).length > 0 && fields.title && fields.description && fields.service_id && fields.sex && isImage(files.filetoupload.name)) {

                var oldpath = files.filetoupload.path;
                var newpath = GalleryImageUploadLocation.path + files.filetoupload.name;
                var dbpath = GalleryImageUploadLocation.dbpath + files.filetoupload.name;
                var service_id = fields.service_id;
                var title = fields.title.toLowerCase();
                var description = fields.description.toLowerCase();
                var sex = fields.sex.toLowerCase();

                Service.findOne({id: service_id}).exec(function (err, findService) {
                    if (findService) {
                        fs_extra.move(oldpath, newpath, function (err) {
                            if (err) {
                                check_flow = false;
                                res.status(500)
                                    .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                            }

                            if (check_flow) {

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
                                                    .json({data: InsertService, result: "Save Successfully"});
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
                    } else {
                        check_flow = false;
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

            if (Object.keys(files).length > 0 && fields.title && fields.description && fields.service_id && fields.sex && fields.id && isImage(files.filetoupload.name)) {

                var oldpath = files.filetoupload.path;
                var newpath = GalleryImageUploadLocation.path + files.filetoupload.name;
                var dbpath = GalleryImageUploadLocation.dbpath + files.filetoupload.name;
                var service_id = fields.service_id;
                var id = fields.id;
                var title = fields.title.toLowerCase();
                var description = fields.description.toLowerCase();
                var sex = fields.sex.toLowerCase();

                var response = {
                    id,
                    service_id,
                    image_url: dbpath,
                    title,
                    description,
                    sex
                };


                Service.findOne({id: service_id}).exec(function (err, findService) {

                    if (findService) {

                        if (check_flow) {

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

                                            fs_extra.move(oldpath, newpath, function (err) {
                                                if (err) {
                                                    check_flow = false;
                                                    res.status(500)
                                                        .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                                                }
                                            });

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
                    } else {
                        check_flow = false;
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
