const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {api_validate} = require("../../components/validate");
const Joi = require("joi");
const md5 = require("md5");
const {generateString} = require("../../components/functions");
const {extFrom} = require("../../components/mimeToExt");
const TeamsResource = require("../resources/teamsResource");
class TeamsController {
    constructor() {
        //
    }
    async index(req, res, next)
    {
        return res.send({message: "index"});
    }

    async create(req, res, next)
    {
        let valid_err = api_validate({
            first_name: Joi.string().min(2).max(30).required(),
            last_name: Joi.string().min(2).max(30).required(),
            rank: Joi.string().min(2).max(512),
            title: Joi.string().min(2).max(512),
            description: Joi.string().min(2).max(512),
        }, req, res);
        // return res.send({tmp: 'ok'});
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let locale = res.locals.$api_local;
        let {first_name, last_name, rank, title, description, active} = req.body;
        let {image, images} = req.files ?? {image: null, images: null};
        console.log(first_name, last_name, rank, title, description, active, image, images);
        // return res.send({is: "ok"});
        let teamData = {first_name, last_name};
        if(rank){
            teamData.rank = JSON.stringify({
                [locale]: rank
            });
        }
        if(title){
            teamData.title = JSON.stringify({
                [locale]: title
            });
        }
        if(description){
            teamData.description = JSON.stringify({
                [locale]: description
            });
        }
        try {
            if(image && !Array.isArray(image)){
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(image.mimetype, image.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                    res.status(422);
                    return res.send({errors: 'image not a jpg or png.'});
                }
                let uploaded = saveFileContentToPublic('storage/uploads/teams', imageName + ext, image.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'image not uploaded.'});
                }
                image = 'storage/uploads/teams/' + imageName + ext;
                teamData.image = image;
            }
            if(images && !Array.isArray(images)){
                images = [images];
            }
            teamData.images = [];
            for(let img of images ?? []){
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(img.mimetype, img.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                    res.status(422);
                    return res.send({errors: 'image not a jpg or png.'});
                }
                let uploaded = saveFileContentToPublic('storage/uploads/teams', imageName + ext, img.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'image not uploaded.'});
                }
                image = 'storage/uploads/teams/' + imageName + ext;
                teamData.images.push(image);
            }
            if(teamData.images.length < 1){
                delete teamData.images;
            }else{
                teamData.images = JSON.stringify(teamData.images);
            }
            teamData.created_at = moment().format('yyyy-MM-DD HH:mm:ss');
            teamData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
            await DB('teams').create(teamData);
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Team not created.'});
        }
        let team = await new TeamsResource(teamData, locale);
        return res.send({data: {team: team}, message: "Team created successfully.", errors: {}});
    }

    async store(req, res, next)
    {
        //
    }

    async show(req, res, next)
    {
        //
    }

    async edit(req, res, next)
    {
        //
    }

    async update(req, res, next)
    {
        //
    }

    async destroy(req, res, next)
    {
        //
    }

}

module.exports = TeamsController;