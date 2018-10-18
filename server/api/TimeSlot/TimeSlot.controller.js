import TimeSlot from './TimeSlot.model';
import {errorJsonResponse, getGuid} from '../../config/commonHelper';
import Product from '../Product/Product.model'
import Team from '../Team/Team.model'

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

// Gets a list of TimeSlots
export function index(req, res) {
    return TimeSlot.find({}, {__v: 0, _id: 0}).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function addTimeSlot(req, res, next) {
    try {
        if (req.body) {

            let product_id = req.body.product_id;
            let team_id = req.body.team_id;
            let times = req.body.times;

            Team.find({id: team_id}).exec()
                .then(function (TeamResponse) {
                    if (TeamResponse.length > 0) {
                        Product.find({id: product_id}).exec()
                            .then(function (ProductResponse) {
                                if (ProductResponse.length > 0) {

                                    TimeSlot.find({product_id: product_id, team_id: team_id}).exec()
                                        .then(function (TimeSlotResponse) {
                                            if (TimeSlotResponse.length > 0) {
                                                res.status(400)
                                                    .json(errorJsonResponse('TimeSlot already Available', 'TimeSlot already Available'));
                                            } else {
                                                let TimeSlotAdd = new TimeSlot({
                                                    product_id: product_id,
                                                    team_id: team_id,
                                                    times: times
                                                });
                                                TimeSlotAdd.save()
                                                    .then(function (InsertTimeSlot, err) {
                                                        if (!err) {
                                                            if (InsertTimeSlot) {
                                                                res.status(200)
                                                                    .json({
                                                                        data: InsertTimeSlot,
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
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse('Product not found', 'Product not found'));
                                }
                            });
                    } else {
                        res.status(400)
                            .json(errorJsonResponse('Team member not found', 'Team member not found'));
                    }
                });
        }
    } catch (err) {
        res.status(400).json(errorJsonResponse(err.message.toString(), err.message.toString()));
    }
}

export function Times(req, res, next) {
    try {

        let product_id = req.body.product_id;
        let team_id = req.body.team_id;

        if (req.body) {
            return TimeSlot.find({product_id: product_id, team_id: team_id}, {__v: 0, _id: 0}).exec()
                .then(respondWithResult(res))
                .catch(handleError(res));
        }

    } catch (err) {
        res.status(400).json(errorJsonResponse(err.message.toString(), err.message.toString()));
    }
}
