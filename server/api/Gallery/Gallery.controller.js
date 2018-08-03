/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/Gallerys              ->  index
 * POST    /api/Gallerys              ->  create
 * GET     /api/Gallerys/:id          ->  show
 * PUT     /api/Gallerys/:id          ->  upsert
 * PATCH   /api/Gallerys/:id          ->  patch
 * DELETE  /api/Gallerys/:id          ->  destroy
 */

import Gallery from './Gallery.model';
import {jwtdata,errorJsonResponse,getGuid,imageUploadLocation} from '../../config/commonHelper';

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

// Gets a list of Gallerys
export function index(req, res) {
    return Gallery.find().sort({date:-1}).limit(10).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function deleteGallery(req,res) {
    //console.log(req.decoded);
    let check_field = true;
    let galleryId;
    if(req.params.galleryId){
        galleryId = req.params.galleryId;
    }else{
        check_field = false;
        res.status(500)
            .json(errorJsonResponse("Id is required", "Id is required"));
    }

    if(check_field) {
        Gallery.remove({id:galleryId})
            .exec(function(err, DeleteGallery) {
                if(!err) {
                    if(DeleteGallery) {
                        if(DeleteGallery.result.n == 1){
                            res.status(200)
                                .json({id:galleryId,result:"deleted Sucessfully"});
                        }else{
                            res.status(403)
                                .json({result:"deleted fail"});
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
    }
}


