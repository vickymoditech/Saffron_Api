import Coupon from './coupon.model';
import {errorJsonResponse, getGuid} from '../../config/commonHelper';
import Oauth from '../oauth/oauth.model';

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

export async function create(req, res, next) {
    try {
        if(req.body) {
            const coupon = new Coupon({
                id: getGuid(),
                name: req.body.name,
                info: req.body.info,
                minPrice: req.body.minPrice,
                maxDiscount: req.body.maxDiscount,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
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

export async function upsert(req, res, next) {
    try {
        const couponId = req.params.couponId;
        const userId = req.params.userId;

        //Todo add deviceRegister token
        const UserIdFind = await Oauth.findOne({id: couponId, userId: userId});
        if(!UserIdFind) {
            res.status(400)
                .json({result: 'success'});
        } else {
            res.status(400)
                .json(errorJsonResponse('you have already used this coupon', 'you have already used this coupon'));
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
