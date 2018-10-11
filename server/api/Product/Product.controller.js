import Product from './Product.model';
import Service from '../Service/Service.model';

import {errorJsonResponse, GalleryImageUploadLocation, getGuid} from '../../config/commonHelper';

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

// Gets a list of Products
export function index(req, res) {
    return Product.find({}, {__v: 0, _id: 0}).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function addNewProduct(req, res, next) {
    try {
        if (req.body) {

            let service_id = req.body.service_id;
            let price = req.body.price;
            let offerPrice = req.body.offerPrice;
            let title = req.body.title;
            let description = req.body.description;
            let sex = req.body.sex;

            try {
                Service.find({id: service_id}).exec(function (err, findService) {
                    if (findService.length > 0) {
                        let product = new Product({
                            id: getGuid(),
                            service_id: service_id,
                            price: price,
                            offerPrice: offerPrice,
                            title: title,
                            description: description,
                            date: new Date().toISOString(),
                            sex: sex
                        });
                        product.save()
                            .then(function (ProductSuccess, err) {
                                if (!err) {
                                    if (ProductSuccess) {

                                        res.status(200)
                                            .json({
                                                data: ProductSuccess,
                                                result: "Registration Successfully"
                                            });

                                    } else {
                                        res.status(404)
                                            .json(errorJsonResponse("Error in db response", "Error in db response"));
                                    }
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse(err, "Contact to your Developer"));
                                }
                            });
                    }
                    else {
                        res.status(403).json(errorJsonResponse("Service is not found", "Service is not found"));
                    }
                });
            }
            catch
                (error) {
                res.status(501).json(errorJsonResponse(error, "contact to developer"))
            }
        }
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Request"));
    }
}

export function updateProduct(req, res, next) {
    try {
        if (req.body) {

            let response = {
                id: req.body.id,
                service_id: req.body.service_id,
                price: req.body.price,
                offerPrice: req.body.offerPrice,
                title: req.body.title,
                description: req.body.description,
                sex: req.body.sex,
            };

            try {
                Service.find({id: response.service_id}).exec(function (err, findService) {
                    if (findService.length > 0) {
                        Product.update({id: response.id}, {
                            service_id: response.service_id,
                            price: response.price,
                            offerPrice: response.offerPrice,
                            title: response.title,
                            description: response.description,
                            sex: response.sex
                        }).exec(function (err, UpdateProduct) {
                            if (!err) {
                                if (UpdateProduct) {
                                    if (UpdateProduct.nModified === 1 && UpdateProduct.n === 1) {
                                        res.status(200)
                                            .json({
                                                data: response,
                                                result: "updated Successfully"
                                            });

                                    } else if (UpdateProduct.n === 1) {
                                        res.status(200)
                                            .json({result: "already updated"});
                                    } else {
                                        res.status(403)
                                            .json({result: "Record not found"});
                                    }
                                } else {
                                    res.status(404)
                                        .json(errorJsonResponse("Fail Update", "Fail Update"));
                                }
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse(err, "Contact to your Developer"));
                            }
                        });
                    }
                    else {
                        res.status(403).json(errorJsonResponse("Service is not found", "Service is not found"));
                    }
                });
            }
            catch
                (error) {
                res.status(501).json(errorJsonResponse(error, "contact to developer"))
            }
        }
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Request"));
    }
}
