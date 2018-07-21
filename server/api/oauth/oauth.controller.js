/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/oauths              ->  index
 */

'use strict';

import Oauth from './oauth.model';
import moment from 'moment/moment';
import {jwtdata,errorJsonResponse} from '../../config/commonHelper';
import jwt from 'jsonwebtoken';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
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
    if(req.body) {
        let pass;
        let userId;
        let check_field = true;

        if(req.body.userId){
            userId = req.body.userId;
            if(req.body.password){
                pass = req.body.password;
            }else{
                check_field = false;
                res.status(500).json(errorJsonResponse("password is required","password is required"));
            }
        }else{
            check_field = false;
            res.status(500).json(errorJsonResponse("userId is required","userId is required"));
        }

        if(check_field){

            Oauth.findOne({userId: userId, password: pass})
                .exec(function(err, loginUser) {
                    if(!err) {
                        if(loginUser){

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
                        }else{
                            res.status(404).json(errorJsonResponse("Invalid_user","Invalid_user"));
                        }
                    }else{
                        res.status(400).json(errorJsonResponse(err,"come_to_store_sorry"));
                    }
                });
        }
    }
}






