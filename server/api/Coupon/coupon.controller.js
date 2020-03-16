import Coupon from './coupon.model';
import {errorJsonResponse, getGuid} from '../../config/commonHelper';
import Oauth from '../oauth/oauth.model';

let moment = require('moment-timezone');

export async function index(req, res, next) {
    try {
        Coupon.find({})
            .exec((error, coupons) => {
                if(!error) {
                    res.status(200)
                        .json(coupons);
                } else {
                    res.status(400)
                        .json(errorJsonResponse(error.toString(), 'Internal server Error'));
                }
            });
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), 'Internal server Error'));
    }
}

export async function GetValidCoupons(req, res, next) {
    try {
        let dayDateTime = moment()
            .tz('Asia/Kolkata')
            .startOf('day')
            .format();
        let NormalDateEndDateTime = new Date(dayDateTime);
        Coupon.find({
            endDate: {
                $gte: NormalDateEndDateTime.toUTCString()
            }
        })
            .exec((error, coupons) => {
                if(!error) {
                    res.status(200)
                        .json(coupons);
                } else {
                    res.status(400)
                        .json(errorJsonResponse(error.toString(), 'Internal server Error'));
                }
            });
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), 'Internal server Error'));
    }
}

export async function create(req, res, next) {
    try {
        if(req.body) {
            const coupon = new Coupon({
                id: getGuid(),
                name: req.body.name,
                info: req.body.info,
                percentage: req.body.percentage,
                minPrice: req.body.minPrice,
                maxPrice: req.body.maxPrice,
                maxDiscount: req.body.maxDiscount,
                startDate: new Date(req.body.startDate).toUTCString(),
                endDate: new Date(req.body.endDate).toUTCString(),
                userId: []
            });
            coupon.save()
                .then((result, error) => {
                    if(!error) {
                        res.status(200)
                            .json({result: 'Coupon Add Successfully', data: result});
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(error.toString(), 'Internal server Error'));
                    }
                });
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), 'Internal server Error'));
    }
}

export async function checkCoupon(req, res, next) {
    try {
        const couponName = req.params.couponName;
        const user = req.decoded;

        //Todo check coupon exist or not (date wise)
        let dayDateTime = moment()
            .tz('Asia/Kolkata')
            .startOf('day')
            .format();
        let NormalDateEndDateTime = new Date(dayDateTime);
        const getCoupon = await Coupon.findOne({name: couponName, startDate: {$lte: NormalDateEndDateTime.toUTCString()}, endDate: {$gte: NormalDateEndDateTime.toUTCString()}});
        if(getCoupon) {
            //Todo check coupon valid for user ot not
            const UserIdFind = await Coupon.findOne({id: getCoupon.id, userId: user.user.userId});
            if(!UserIdFind) {
                res.status(200)
                    .json({result: `${couponName} Successfully applied`, couponDetail: getCoupon});
            } else {
                res.status(400)
                    .json(errorJsonResponse('you already have used this coupon', 'you already have used this coupon'));
            }
        } else {
            res.status(400)
                .json(errorJsonResponse('Invalid Coupon', 'Invalid Coupon'));
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), 'Internal server Error'));
    }
}


export async function destroy(req, res, next) {
    try {
        const couponId = req.params.couponId;
        Coupon.remove({id: couponId})
            .exec(function(err, DeleteCoupon) {
                if(!err) {
                    if(DeleteCoupon) {
                        if(DeleteCoupon.result.n === 1) {
                            res.status(200)
                                .json({id: couponId, result: 'Coupon Successfully Deleted'});
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
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), 'Internal server Error'));
    }
}
