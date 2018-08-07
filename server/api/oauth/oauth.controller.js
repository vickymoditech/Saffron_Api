/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/oauths              ->  index
 */

'use strict';

import Oauth from './oauth.model';
import moment from 'moment/moment';
import {jwtdata,errorJsonResponse,getGuid} from '../../config/commonHelper';
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

export function register(req,res,next) {
    if(req.body) {

       let first_name = req.body.first_name;
       let last_name = req.body.last_name;
       let mobile_number = req.body.mobile_number;
       let password = req.body.password;

       try{

           let registrationUser = new Oauth({id:getGuid(),first_name:first_name,last_name:last_name,contact_no:mobile_number,email_id:'',userId:mobile_number,password:password,role:'user'});
           registrationUser.save()
               .then(function(RegistrationSuccess,err) {
                   if(!err) {
                       if(RegistrationSuccess) {
                           res.status(200)
                               .json({data:RegistrationSuccess,result:"Save Successfully"});
                       } else {
                           res.status(404)
                               .json(errorJsonResponse("Error in db response", "Invalid_Image"));
                       }
                   } else {
                       res.status(400)
                           .json(errorJsonResponse(err, "Contact to your Developer"));
                   }
               });


       }catch (error){

           res.status(501).json(errorJsonResponse(error,"contact to developer"))

       }



    }
}





