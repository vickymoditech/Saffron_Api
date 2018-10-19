import BookingProduct from './BookingProduct.model';

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

// Gets a list of BookingProducts
export function index(req, res) {
    return BookingProduct.find({}, {_id: 0, __v: 0}).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}
