/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/oauths              ->  index
 */

'use strict';

import Oauth from './oauth.model';
import moment from 'moment/moment';
import {jwtdata, errorJsonResponse, getGuid} from '../../config/commonHelper';
import jwt from 'jsonwebtoken';


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

// Gets a list of oauth
export function index(req, res) {
    return Oauth.find().exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

//Login Valid User
export function login(req, res) {
    if (req.body) {
        let pass;
        let userId;
        let check_field = true;

        if (req.body.userId) {
            userId = req.body.userId;
            if (req.body.password) {
                pass = req.body.password;
            } else {
                check_field = false;
                res.status(500).json(errorJsonResponse("password is required", "password is required"));
            }
        } else {
            check_field = false;
            res.status(500).json(errorJsonResponse("userId is required", "userId is required"));
        }

        if (check_field) {

            Oauth.findOne({userId: userId, password: pass, block: false})
                .exec(function (err, loginUser) {
                    if (!err) {
                        if (loginUser) {

                            let expiresIn = 60 * 60 * 24; // expires in 24 hours
                            let issued = moment(Date.now());
                            let token = jwt.sign({user: loginUser}, jwtdata.jwtSecretKey, {
                                expiresIn: expiresIn
                            });
                            let expires = moment(issued)
                                .add(expiresIn, 'seconds');
                            res.status(200)
                                .json({
                                    token,
                                    expiresIn,
                                    issued,
                                    expires
                                });
                        } else {
                            res.status(404).json(errorJsonResponse("Invalid_user", "Invalid_user"));
                        }
                    } else {
                        res.status(400).json(errorJsonResponse(err, "come_to_store_sorry"));
                    }
                });
        }
    }
}

export function register(req, res, next) {
    if (req.body) {

        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let mobile_number = req.body.mobile_number;
        let password = req.body.password;
        let role = req.body.role;

        try {

            let alreadyAvailable = false;
            //check mobile number is already register or not
            Oauth.find({userId: mobile_number}).exec(function (err, findUser) {

                if (findUser.length > 0) {
                    alreadyAvailable = true;
                }

                if (!alreadyAvailable) {

                    let registrationUser = new Oauth({
                        id: getGuid(),
                        first_name: first_name,
                        last_name: last_name,
                        contact_no: mobile_number,
                        email_id: '',
                        userId: mobile_number,
                        password: password,
                        role: role,
                        block: false
                    });
                    registrationUser.save()
                        .then(function (RegistrationSuccess, err) {
                            if (!err) {
                                if (RegistrationSuccess) {

                                    let expiresIn = 60 * 60 * 24; // expires in 24 hours
                                    let issued = moment(Date.now());
                                    let token = jwt.sign({user: RegistrationSuccess}, jwtdata.jwtSecretKey, {
                                        expiresIn: expiresIn
                                    });
                                    let expires = moment(issued)
                                        .add(expiresIn, 'seconds');
                                    res.status(200)
                                        .json({
                                            data: RegistrationSuccess,
                                            token,
                                            expiresIn,
                                            issued,
                                            expires,
                                            result: "Registration Successfully"
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

                } else {
                    res.status(403).json(errorJsonResponse("Mobile number is already register", "Mobile number is already register"));
                }


            });


        }
        catch
            (error) {

            res.status(501).json(errorJsonResponse(error, "contact to developer"))

        }


    }
}

export function updateUser(req, res, next) {
    if (req.body) {

        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let mobile_number = req.body.mobile_number;
        let password = req.body.password;
        let role = req.body.role;
        let block = req.body.block;
        let old_mobile_number = req.body.old_mobile_number;

        let userObject = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile_number: req.body.mobile_number,
            password: req.body.password,
            role: req.body.role,
            block: req.body.block,
        }


        try {


            if (mobile_number === old_mobile_number) {

                Oauth.update({userId: old_mobile_number},
                    {
                        first_name: first_name,
                        last_name: last_name,
                        contact_no: mobile_number,
                        email_id: '',
                        userId: mobile_number,
                        password: password,
                        role: role,
                        block: block
                    }
                ).exec(function (err, UpdateUser) {
                    if (!err) {
                        if (UpdateUser) {
                            if (UpdateUser.nModified == 1 && UpdateUser.n == 1) {
                                res.status(200)
                                    .json({
                                        data: {userObject},
                                        result: "updated Successfully "
                                    });
                            } else if (UpdateUser.n == 1) {
                                res.status(200)
                                    .json({result: "already uptodate"});
                            } else {
                                res.status(403)
                                    .json({result: "not found"});
                            }

                        } else {
                            res.status(404)
                                .json(errorJsonResponse("Invalid_Image", "Invalid_Image"));
                        }
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(err, "Contact to your Developer"));
                    }
                });

            } else {

                let alreadyAvailable = false;
                //check mobile number is already register or not
                Oauth.find({userId: mobile_number}).exec(function (err, findUser) {

                    if (findUser.length > 0) {
                        alreadyAvailable = true;
                    }

                    if (!alreadyAvailable) {

                        Oauth.update({userId: old_mobile_number},
                            {
                                first_name: first_name,
                                last_name: last_name,
                                contact_no: mobile_number,
                                email_id: '',
                                userId: mobile_number,
                                password: password,
                                role: role,
                                block: block
                            }
                        ).exec(function (err, UpdateUser) {
                            if (!err) {
                                if (UpdateUser) {
                                    if (UpdateUser.nModified == 1 && UpdateUser.n == 1) {
                                        res.status(200)
                                            .json({
                                                data: {userObject},
                                                result: "updated Successfully "
                                            });
                                    } else if (UpdateUser.n == 1) {
                                        res.status(200)
                                            .json({result: "already updated"});
                                    } else {
                                        res.status(403)
                                            .json({result: "not found"});
                                    }

                                } else {
                                    res.status(404)
                                        .json(errorJsonResponse("Invalid_Image", "Invalid_Image"));
                                }
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse(err, "Contact to your Developer"));
                            }
                        });

                    } else {
                        res.status(403).json(errorJsonResponse("Mobile number is already register", "Mobile number is already register"));
                    }
                });
            }
        }
        catch
            (error) {
            res.status(501).json(errorJsonResponse(error, "contact to developer"))
        }
    }
}

export function deleteUser(req, res, next) {
    try {
        let userId = req.params.userId;
        Oauth.remove({id: userId})
            .exec(function (err, DeleteUser) {
                if (!err) {
                    if (DeleteUser) {
                        if (DeleteUser.result.n == 1) {
                            res.status(200)
                                .json({id: userId, result: "deleted Sucessfully"});
                        } else {
                            res.status(403)
                                .json({result: "deleted fail"});
                        }

                    } else {
                        res.status(404)
                            .json(errorJsonResponse("Invalid_post", "Invalid_post"));
                    }
                } else {
                    res.status(400)
                        .json(errorJsonResponse(err, "Contact to your Developer"));
                }
            });

    } catch (error) {
        res.status(400).json(error);
    }
}


