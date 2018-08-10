/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/Services              ->  index
 * POST    /api/Services              ->  create
 * GET     /api/Services/:id          ->  show
 * PUT     /api/Services/:id          ->  upsert
 * PATCH   /api/Services/:id          ->  patch
 * DELETE  /api/Services/:id          ->  destroy
 */

import {applyPatch} from 'fast-json-patch';
import Service from './Service.model';
import {errorJsonResponse,serviceImageUploadLocation,getGuid} from '../../config/commonHelper';

var formidable = require('formidable');
var fs = require('fs');
var fs_extra = require('fs-extra');

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

// Gets a list of Services
export function index(req, res) {
    return Service.find().exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function deleteService(req, res, next) {
    try {

        let check_field = true;
        let serviceId;
        if (req.params.serviceId) {
            serviceId = req.params.serviceId;
        } else {
            check_field = false;
            res.status(500)
                .json(errorJsonResponse("Id is required", "Id is required"));
        }

        if (check_field) {
            Service.remove({id: serviceId})
                .exec(function (err, DeleteService) {
                    if (!err) {
                        if (DeleteService) {
                            if (DeleteService.result.n == 1) {
                                res.status(200)
                                    .json({id: serviceId, result: "Deleted Successfully"});
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


    } catch (error) {
        res.status(400).json(errorJsonResponse(error, "Contact to your Developer"));
    }
}

export function addNewService(req, res, next) {
    try {
        var form = new formidable.IncomingForm();
        let check_flow = true;
        form.parse(req, function (err, fields, files) {

            if (Object.keys(files).length > 0 && fields.title && fields.discription) {
                var oldpath = files.filetoupload.path;
                //console.log(imageUploadLocation.path);
                var newpath = serviceImageUploadLocation.path + files.filetoupload.name;
                var dbpath = serviceImageUploadLocation.dbpath + files.filetoupload.name;
                var title = fields.title;
                var discription = fields.discription;

                fs_extra.move(oldpath, newpath, function (err) {
                    if (err) {
                        check_flow = false;
                        res.status(500)
                            .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                    }

                    if (check_flow) {

                        let ServiceNewAdd = new Service({id: getGuid(), image_url: dbpath, title: title, discription: discription});
                        ServiceNewAdd.save()
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


