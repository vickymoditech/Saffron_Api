import WebSiteHome from './WebSiteHome.model';
import {jwtdata,errorJsonResponse,getGuid,imageUploadLocation} from '../../config/commonHelper';
var formidable = require('formidable');
var fs = require('fs');
var fs_extra = require('fs-extra');

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

// Gets a list of WebSiteHomes
export function index(req, res) {
  return WebSiteHome.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function deleteHomeImage(req,res) {

    //console.log(req.decoded);
    let check_field = true;
    let imageId;
    if(req.params.imageId){
        imageId = req.params.imageId;
    }else{
        check_field = false;
        res.status(500)
            .json(errorJsonResponse("ImageId is required", "ImageId is required"));
    }

    if(check_field) {
        WebSiteHome.remove({id:imageId})
            .exec(function(err, DeleteHomeImage) {
                if(!err) {
                    if(DeleteHomeImage) {
                        if(DeleteHomeImage.result.n == 1){
                            res.status(200)
                                .json({result:"deleted Sucessfully "});
                        }else{
                            res.status(403)
                                .json({result:"deleted fail"});
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
        }
}

export function updateHomeImage(req,res) {
    if(req.body){

        let check_field = true;
        let imageId;
        let flag;

        if(req.params.imageId){
            imageId = req.params.imageId;
            if(req.body.visible.toString() != ''){
             flag = req.body.visible;
            }else{
                check_field = false;
                res.status(500)
                    .json(errorJsonResponse("visibility flag is required", "visibility flag  required"));
            }
        }else{
            check_field = false;
            res.status(500)
                .json(errorJsonResponse("ImageId is required", "ImageId is required"));
        }

        if(check_field) {
            WebSiteHome.update({id:imageId},{visible:flag})
                .exec(function(err, UpdateHomeImage) {
                    if(!err) {
                        if(UpdateHomeImage) {
                            if(UpdateHomeImage.nModified == 1 && UpdateHomeImage.n == 1){
                                res.status(200)
                                    .json({data:{imageId:imageId,visible:flag},result:"updated Successfully "});
                            }else if(UpdateHomeImage.n == 1){
                                res.status(200)
                                    .json({result:"already updated"});
                            }else{
                                res.status(403)
                                    .json({result:"not found"});
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
        }
    }
}




export function uploadHomeImage(req,res) {
        var form = new formidable.IncomingForm();
        let check_flow = true;
        form.parse(req,function(err,fields,files) {
            var oldpath = files.filetoupload.path;
            //console.log(imageUploadLocation.path);
            var newpath = imageUploadLocation.path+files.filetoupload.name;
            var dbpath = imageUploadLocation.dbpath+files.filetoupload.name;
            fs_extra.move(oldpath,newpath,function(err) {
                if(err) {
                    check_flow = false;
                    res.status(500)
                        .json(errorJsonResponse(err.toString(),"same name image already available on server"));
                }
                if(check_flow){

                    let WebSiteHome1= new WebSiteHome({id:getGuid(),image_url:dbpath,visible:true});
                    WebSiteHome1.save()
                        .then(function(InsertHomeImage,err) {
                            if(!err) {
                                if(InsertHomeImage) {
                                    res.status(200)
                                        .json({data:InsertHomeImage,result:"Save Successfully"});
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
            })
        })
}
