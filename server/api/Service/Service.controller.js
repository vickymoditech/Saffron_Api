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
            Gallery.remove({id: serviceId})
                .exec(function (err, DeleteGallery) {
                    if (!err) {
                        if (DeleteGallery) {
                            if (DeleteGallery.result.n == 1) {
                                res.status(200)
                                    .json({id: galleryId, result: "deleted Sucessfully"});
                            } else {
                                res.status(403)
                                    .json({result: "deleted fail"});
                            }

                        } else {
                            res.status(404)
                                .json(errorJsonResponse("Invalid_post", "Invalid_post"));
                        }
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(err, "Contact to your Developer"));
                    }
                });
        }


    } catch (error) {
        res.status(400).json(error);
    }
}
