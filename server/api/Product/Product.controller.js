import Product from './Product.model';
import Service from '../Service/Service.model';
import {errorJsonResponse, ProductImageUploadLocation, getGuid} from '../../config/commonHelper';

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

// Home Product Page
export function index(req, res) {
    return Service.aggregate({"$unwind": "$id"},
        {
            "$lookup": {
                "from": "products",
                "localField": "id",
                "foreignField": "service_id",
                "as": "itemsObjects"
            }
        },
        {
            "$group": {
                "_id": "$_id",
                "service_id": {"$first": "$id"},
                "image_url": {"$first": "$image_url"},
                "title": {"$first": "$title"},
                "description": {"$first": "$description"},
                "date": {"$first": "$date"},
                "products": {"$first": "$itemsObjects"}
            }
        },
        {$sort: {date: 1}}).exec()
        .then(respondWithResult(res, 200))
        .catch(handleError(res));
}

// Gets a list of Products
export function allProduct(req, res) {
    return Product.aggregate({"$unwind": "$id"},
        {
            "$lookup": {
                "from": "services",
                "localField": "service_id",
                "foreignField": "id",
                "as": "itemsObjects"
            }
        }, {
            $unwind: "$itemsObjects"
        },
        {
            "$group": {
                "_id": "$_id",
                "id": {"$first": "$id"},
                "image_url": {"$first": "$image_url"},
                "title": {"$first": "$title"},
                "description": {"$first": "$description"},
                "date": {"$first": "$date"},
                "price": {"$first": "$price"},
                "offerPrice": {"$first": "$offerPrice"},
                "service_id": {"$first": "$service_id"},
                "sex": {"$first": "$sex"},
                "service_title": {"$first": "$itemsObjects.title"}
            }
        },
        {$sort: {date: 1}}).exec()
        .then(respondWithResult(res, 200))
        .catch(handleError(res));
}


export function addNewProduct(req, res, next) {
    try {
        let form = new formidable.IncomingForm();
        let reg = /^\d+$/;
        form.parse(req, function (err, fields, files) {
            if (Object.keys(files).length > 0 && fields.title && fields.description && fields.service_id && fields.sex && fields.price && fields.price.match(reg) && fields.offerPrice && fields.offerPrice.match(reg) && isImage(files.filetoupload.name)) {
                let uuid = getGuid();
                let oldpath = files.filetoupload.path;
                let newpath = ProductImageUploadLocation.path + files.filetoupload.name;
                let dbpath = ProductImageUploadLocation.dbpath + uuid + files.filetoupload.name;
                let renameFilePath = ProductImageUploadLocation.path + uuid + files.filetoupload.name;
                let service_id = fields.service_id;
                let title = fields.title.toLowerCase();
                let description = fields.description.toLowerCase();
                let sex = fields.sex.toLowerCase();
                let price = fields.price;
                let offerPrice = fields.offerPrice;

                Service.findOne({id: service_id}).exec(function (err, findService) {
                    // find the service.
                    if (findService) {
                        fs_extra.move(oldpath, newpath, function (err) {
                            if (err) {
                                res.status(400)
                                    .json(errorJsonResponse(err.toString(), "Same Name Image Already Available On Server"));
                            } else {
                                fs.rename(newpath, renameFilePath, function (err) {
                                    if (err) {
                                        res.status(400).json(errorJsonResponse(err.toString(), "Fail to Rename file"));
                                    } else {
                                        let ProductAdd = new Product({
                                            id: getGuid(),
                                            service_id: service_id,
                                            price: price,
                                            offerPrice: offerPrice,
                                            image_url: dbpath,
                                            title: title,
                                            description: description,
                                            date: new Date().toISOString(),
                                            sex: sex
                                        });
                                        ProductAdd.save()
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
                                });
                            }
                        });
                    } else {
                        res.status(400)
                            .json(errorJsonResponse("Service Not Found ", "Service Not Found"));
                    }
                });
            } else {
                res.status(400).json(errorJsonResponse("Invalid Request", "Invalid Request"));
            }
        });
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
                                    if (UpdateProduct.nModified === 1 || UpdateProduct.n === 1) {
                                        res.status(200)
                                            .json({
                                                data: response,
                                                result: "updated Successfully"
                                            });

                                    } else {
                                        res.status(400)
                                            .json(errorJsonResponse("Record not found", "Record not found"));
                                    }
                                } else {
                                    res.status(400)
                                        .json(errorJsonResponse("Fail Update", "Fail Update"));
                                }
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse(err, "Contact to your Developer"));
                            }
                        });
                    }
                    else {
                        res.status(400).json(errorJsonResponse("Service is not found", "Service is not found"));
                    }
                });
            }
            catch
                (error) {
                res.status(400).json(errorJsonResponse(error, "contact to developer"))
            }
        }
    }
    catch (Error) {
        res.status(400).json(errorJsonResponse(Error.toString(), "Invalid Request"));
    }
}

export function deleteProduct(req, res, next) {
    try {
        if (req.params.productId) {
            let productId = req.params.productId;
            Product.remove({id: productId})
                .exec(function (err, DeleteTeam) {
                    if (!err) {
                        if (DeleteTeam) {
                            if (DeleteTeam.result.n === 1) {
                                res.status(200)
                                    .json({id: productId, result: 'Deleted Successfully'});
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse('Deleted Fail', 'Deleted Fail'));
                            }
                        } else {
                            res.status(400)
                                .json(errorJsonResponse('Invalid Post', 'Invalid Post'));
                        }
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(err, 'Contact to your Developer'));
                    }
                });
        } else {
            res.status(400)
                .json(errorJsonResponse('Id is required', 'Id is required'));
        }

    } catch (error) {
        res.status(400)
            .json(errorJsonResponse(error, 'Contact to your Developer'));
    }
}

export function teamProduct(req, res, next) {
    try {
        if (req.params.productId) {
            let productId = req.params.productId;
            return Product.aggregate([
                {
                    $match: {id: productId}
                },
                {"$unwind": "$id"},
                {
                    "$lookup": {
                        "from": "teams",
                        "localField": "id",
                        "foreignField": "product_id",
                        "as": "TeamObjects"
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "id": {"$first": "$id"},
                        "title": {"$first": "$title"},
                        "teams": {"$first": "$TeamObjects"}
                    }
                }
            ]).exec()
                .then(respondWithResult(res, 200))
                .catch(handleError(res));
        } else {
            res.status(400)
                .json(errorJsonResponse("Product Id is required", "Product Id is required"));
        }

    } catch (error) {
        res.status(400).json(errorJsonResponse(error, "Contact to your Developer"));
    }
}
