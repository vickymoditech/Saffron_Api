import {applyPatch} from 'fast-json-patch';
import TeamMemberProduct from './TeamMemberProduct.model';
import {errorJsonResponse, getGuid} from '../../config/commonHelper';
import Product from '../Product/Product.model';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode)
                .json(entity);
        }
        return null;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode)
            .send(err);
    };
}

export function addTeamProduct(req, res, next) {
    try {
        if (req.body) {

            let id = req.body.id;
            let product_id = req.body.product_id;
            let TeamObject = {
                id,
                product_id
            };

            try {
                Product.find({id: product_id}).exec(function (err, findProduct) {
                    if (findProduct.length > 0) {
                        let TeamMemberProductAdd = new TeamMemberProduct({
                            id: getGuid(),
                            teamMember_id: TeamObject.id,
                            product_id: TeamObject.product_id,
                            approxTime: 5,
                        });
                        TeamMemberProductAdd.save()
                            .then(function (InsertTeamMemberProductAdd, err) {
                                if (!err) {
                                    if (InsertTeamMemberProductAdd) {
                                        res.status(200)
                                            .json({
                                                data: InsertTeamMemberProductAdd,
                                                result: "Successfully Add new product"
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
                    else {
                        res.status(400).json(errorJsonResponse("Product is not found", "Product is not found"));
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

export function removeTeamProduct(req, res, next) {
    try {
        if (req.body) {

            let id = req.body.id;
            let product_id = req.body.product_id;
            let TeamObject = {
                id,
                product_id
            };

            try {
                Product.find({id: product_id}).exec(function (err, findService) {
                    if (findService.length > 0) {
                        TeamMemberProduct.remove({teamMember_id: TeamObject.id, product_id: TeamObject.product_id})
                            .exec(function (err, DeleteTeamMember) {
                                if (!err) {
                                    if (DeleteTeamMember) {
                                        if (DeleteTeamMember.result.n === 1) {
                                            res.status(200)
                                                .json({
                                                    data: TeamObject,
                                                    result: "Successfully Remove Product"
                                                });
                                        } else {
                                            res.status(400)
                                                .json(errorJsonResponse("service not found", "service not found"));
                                        }
                                    }
                                }
                            });
                    }
                    else {
                        res.status(403).json(errorJsonResponse("Product is not found", "Product is not found"));
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

export function teamMemberProductsList(req, res, next) {
    try {
        if (req.params.teamMemberId) {
            let teamMemberId = req.params.teamMemberId;

            TeamMemberProduct.find({teamMember_id: teamMemberId}).exec((err, listTeamMemberProduct) => {
                if (!err) {
                    let productList = [];
                    listTeamMemberProduct.forEach((teamMemberProduct) => {
                        productList.push(teamMemberProduct.product_id);
                    });

                    return Product.find({
                        id: {
                            $in: productList
                        }
                    }).exec(function (err, product) {
                        res.status(200).json(product);
                    })
                } else {
                    res.status(400)
                        .json(errorJsonResponse(err, "Contact to your Developer"));
                }
            });
        } else {
            res.status(400)
                .json(errorJsonResponse("Team Member Id is required", "Team Member Id is required"));
        }
    } catch (error) {
        res.status(400).json(errorJsonResponse(error, "Contact to your Developer"));
    }
}
