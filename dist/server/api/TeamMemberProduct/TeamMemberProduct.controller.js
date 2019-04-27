'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addTeamProduct = addTeamProduct;
exports.removeTeamProduct = removeTeamProduct;
exports.teamMemberProductsList = teamMemberProductsList;

var _fastJsonPatch = require('fast-json-patch');

var _TeamMemberProduct = require('./TeamMemberProduct.model');

var _TeamMemberProduct2 = _interopRequireDefault(_TeamMemberProduct);

var _commonHelper = require('../../config/commonHelper');

var _Product = require('../Product/Product.model');

var _Product2 = _interopRequireDefault(_Product);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function addTeamProduct(req, res, next) {
    try {
        if (req.body) {

            let id = req.body.id;
            let product_id = req.body.product_id;
            let TeamObject = {
                id,
                product_id
            };

            try {
                _Product2.default.find({ id: product_id }).exec(function (err, findProduct) {
                    if (findProduct.length > 0) {
                        let TeamMemberProductAdd = new _TeamMemberProduct2.default({
                            id: (0, _commonHelper.getGuid)(),
                            teamMember_id: TeamObject.id,
                            product_id: TeamObject.product_id,
                            approxTime: 5
                        });
                        TeamMemberProductAdd.save().then(function (InsertTeamMemberProductAdd, err) {
                            if (!err) {
                                if (InsertTeamMemberProductAdd) {
                                    res.status(200).json({
                                        data: InsertTeamMemberProductAdd,
                                        result: "Successfully Add new product"
                                    });
                                } else {
                                    res.status(400).json((0, _commonHelper.errorJsonResponse)("Error in db response", "Invalid_Image"));
                                }
                            } else {
                                res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                            }
                        });
                    } else {
                        res.status(400).json((0, _commonHelper.errorJsonResponse)("Product is not found", "Product is not found"));
                    }
                });
            } catch (error) {
                res.status(400).json((0, _commonHelper.errorJsonResponse)(error, "contact to developer"));
            }
        }
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), "Invalid Request"));
    }
}

function removeTeamProduct(req, res, next) {
    try {
        if (req.body) {

            let id = req.body.id;
            let product_id = req.body.product_id;
            let TeamObject = {
                id,
                product_id
            };

            try {
                _Product2.default.find({ id: product_id }).exec(function (err, findService) {
                    if (findService.length > 0) {
                        _TeamMemberProduct2.default.remove({ teamMember_id: TeamObject.id, product_id: TeamObject.product_id }).exec(function (err, DeleteTeamMember) {
                            if (!err) {
                                if (DeleteTeamMember) {
                                    if (DeleteTeamMember.result.n === 1) {
                                        res.status(200).json({
                                            data: TeamObject,
                                            result: "Successfully Remove Product"
                                        });
                                    } else {
                                        res.status(400).json((0, _commonHelper.errorJsonResponse)("service not found", "service not found"));
                                    }
                                }
                            }
                        });
                    } else {
                        res.status(403).json((0, _commonHelper.errorJsonResponse)("Product is not found", "Product is not found"));
                    }
                });
            } catch (error) {
                res.status(501).json((0, _commonHelper.errorJsonResponse)(error, "contact to developer"));
            }
        }
    } catch (Error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(Error.toString(), "Invalid Request"));
    }
}

function teamMemberProductsList(req, res, next) {
    try {
        if (req.params.teamMemberId) {
            let teamMemberId = req.params.teamMemberId;

            _TeamMemberProduct2.default.find({ teamMember_id: teamMemberId }).exec((err, listTeamMemberProduct) => {
                if (!err) {
                    let productList = [];
                    listTeamMemberProduct.forEach(teamMemberProduct => {
                        productList.push(teamMemberProduct.product_id);
                    });

                    return _Product2.default.find({
                        id: {
                            $in: productList
                        }
                    }).exec(function (err, product) {
                        res.status(200).json(product);
                    });
                } else {
                    res.status(400).json((0, _commonHelper.errorJsonResponse)(err, "Contact to your Developer"));
                }
            });
        } else {
            res.status(400).json((0, _commonHelper.errorJsonResponse)("Team Member Id is required", "Team Member Id is required"));
        }
    } catch (error) {
        res.status(400).json((0, _commonHelper.errorJsonResponse)(error, "Contact to your Developer"));
    }
}
//# sourceMappingURL=TeamMemberProduct.controller.js.map
