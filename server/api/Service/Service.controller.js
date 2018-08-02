/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/Services              ->  index
 * POST    /api/Services              ->  create
 * GET     /api/Services/:id          ->  show
 * PUT     /api/Services/:id          ->  upsert
 * PATCH   /api/Services/:id          ->  patch
 * DELETE  /api/Services/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import Service from './Service.model';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if(entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of Services
export function index(req, res) {
    return Service.find().exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}
