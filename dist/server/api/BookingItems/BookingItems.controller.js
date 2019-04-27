'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');

var _deleteProperty2 = _interopRequireDefault(_deleteProperty);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.index = index;
exports.show = show;
exports.create = create;
exports.upsert = upsert;
exports.patch = patch;
exports.destroy = destroy;

var _fastJsonPatch = require('fast-json-patch');

var _BookingItems = require('./BookingItems.model');

var _BookingItems2 = _interopRequireDefault(_BookingItems);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/BookingItems              ->  index
 * POST    /api/BookingItems              ->  create
 * GET     /api/BookingItems/:id          ->  show
 * PUT     /api/BookingItems/:id          ->  upsert
 * PATCH   /api/BookingItems/:id          ->  patch
 * DELETE  /api/BookingItems/:id          ->  destroy
 */

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function patchUpdates(patches) {
    return function (entity) {
        try {
            (0, _fastJsonPatch.applyPatch)(entity, patches, /*validate*/true);
        } catch (err) {
            return _promise2.default.reject(err);
        }

        return entity.save();
    };
}

function removeEntity(res) {
    return function (entity) {
        if (entity) {
            return entity.remove().then(() => res.status(204).end());
        }
    };
}

function handleEntityNotFound(res) {
    return function (entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of BookingItemss
function index(req, res) {
    return _BookingItems2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single BookingItems from the DB
function show(req, res) {
    return _BookingItems2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new BookingItems in the DB
function create(req, res) {
    return _BookingItems2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Upserts the given BookingItems in the DB at the specified ID
function upsert(req, res) {
    if (req.body._id) {
        (0, _deleteProperty2.default)(req.body, '_id');
    }
    return _BookingItems2.default.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec().then(respondWithResult(res)).catch(handleError(res));
}

// Updates an existing BookingItems in the DB
function patch(req, res) {
    if (req.body._id) {
        (0, _deleteProperty2.default)(req.body, '_id');
    }
    return _BookingItems2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(patchUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a BookingItems from the DB
function destroy(req, res) {
    return _BookingItems2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=BookingItems.controller.js.map
