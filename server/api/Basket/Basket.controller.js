import Basket from './Basket.model';
import {errorJsonResponse, getGuid} from '../../config/commonHelper';

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

// Gets a list of Baskets
export function index(req, res) {
    return Basket.find().exec()
        .then(respondWithResult(res, 200))
        .catch(handleError(res));
}

export function insert(req, res, next) {

    let BasketAdd = new Basket({
        id: getGuid(),
        items: [{id: 0}, {id: 1}],
        createAt: Date.now()
    });
    BasketAdd.save()
        .then(function (InsertService, err) {
            if (!err) {
                if (InsertService) {
                    res.status(200)
                        .json({
                            data: InsertService,
                            result: "Save Successfully"
                        });
                } else {
                    res.status(400)
                        .json(errorJsonResponse("Error in db response", "Invalid_Image"));
                }
            } else {
                res.status(400)
                    .json(errorJsonResponse(err, "Contact to your Developer"));
            }
        });
}
