const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const fs = require('node:fs');
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
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
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
            if("active" in req.body){
                teamData.active = req.body.active;
            }
            let forId = await DB('teams').create(teamData);
            teamData.id = forId.insertId;
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
        let errors = [];
        let {team_id} = req.params;
        let team = null;
        if(!team_id){
            res.status(422);
            return res.send({errors: 'No team id parameter.'});
        }
        let valid_err = api_validate({
            first_name: Joi.string().min(2).max(30),
            last_name: Joi.string().min(2).max(30),
            rank: Joi.string().min(2).max(512),
            title: Joi.string().min(2).max(512),
            description: Joi.string().min(2).max(512),
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let {first_name, last_name, rank, title, description, active, stayImages} = req.body;
        let updatedTeamData = {};
        let locale = res.locals.$api_local;
        try {
            team = await DB('teams').find(team_id);
            if(!team){
                res.status(422);
                return res.send({errors: "Team with this id " + team_id + " can not found."});
            }
            if(first_name){
                updatedTeamData.first_name = first_name;
            }
            if(last_name){
                updatedTeamData.last_name = last_name;
            }
            if(rank){
                let oldRank = team.rank ? JSON.parse(team.rank) : {};
                oldRank[locale] = rank;
                updatedTeamData.rank = JSON.stringify(oldRank);
            }
            if(title){
                let oldTitle = team.title ? JSON.parse(team.title) : {};
                oldTitle[locale] = title;
                updatedTeamData.title = JSON.stringify(oldTitle);
            }
            if(description){
                let oldDescription = team.description ? JSON.parse(team.description) : {};
                oldDescription[locale] = description;
                updatedTeamData.description = JSON.stringify(oldDescription);
            }
            if("active" in req.body){
                updatedTeamData.active = active;
            }

            let teamImage = req.files ? req.files.image : null;
            if (teamImage) {
                let teamImageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(teamImage.mimetype, teamImage.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                    errors.push('Image not a jpg or png format.');
                }else{
                    let uploaded = saveFileContentToPublic('storage/uploads/teams', teamImageName + ext, teamImage.data);
                    if (!uploaded) {
                        errors.push('Image not uploaded.');
                    }else{
                        if(team.image){
                            fs.unlinkSync(__basedir + "/public/" + team.image);
                        }
                        updatedTeamData.image = 'storage/uploads/teams/' + teamImageName + ext;
                    }
                }
            }

            updatedTeamData.images = [];
            let oldImages = team.images ? JSON.parse(team.images) : [];
            stayImages = stayImages ? JSON.parse(stayImages) : [];
            for(let oldImage of oldImages){
                if(stayImages.includes(oldImage)){
                    updatedTeamData.images.push(oldImage);
                }else{
                    try {
                        fs.unlinkSync(__basedir + "/public/" + oldImage);
                    }catch (e) {
                        errors.push('Images item file ' + oldImage + ' can not delete.');
                    }
                }
            }

            let teamImages = req.files ? req.files.images : null;
            if(teamImages && teamImages.length > 0){
                for(let imageItem of teamImages){
                    let imageItemName = md5(Date.now()) + generateString(4);
                    let ext = extFrom(imageItem.mimetype, imageItem.name);
                    if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                        errors.push('Images item not a jpg or png format.');
                        continue;
                    }

                    let uploaded = saveFileContentToPublic('storage/uploads/teams', imageItemName + ext, imageItem.data);
                    if (!uploaded) {
                        errors.push('Images item not uploaded.');
                        continue;
                    }
                    updatedTeamData.images.push('storage/uploads/teams/' + imageItemName + ext);
                }
            }
            updatedTeamData.images = JSON.stringify(updatedTeamData.images);
            if(Object.keys(updatedTeamData).length > 0){
                updatedTeamData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('teams').where("id", team_id).update(updatedTeamData);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Team not updated.'});
        }
        for(let key in updatedTeamData){
            team[key] = updatedTeamData[key];
        }
        team = await new TeamsResource(team, locale);

        return res.send({data:{team}, message: "Team data updated successfully.", errors: errors});
    }

    async destroy(req, res, next)
    {
        let {team_id} = req.params;
        if(!team_id){
            res.status(422);
            return res.send({errors: 'No team id parameter.'});
        }

        let team = null;
        try {
            team = await DB("teams").find(team_id);
            if(!team){
                res.status(422);
                return res.send({errors: "Team with this id " + team_id + " can not found."});
            }
            let imagesToBeDelete = team.images ? JSON.parse(team.images) : [];
            if(team.image){
                imagesToBeDelete.push(team.image);
            }
            for(let imageToBeDelete of imagesToBeDelete){
                try {
                    fs.unlinkSync(__basedir + "/public/" + imageToBeDelete);
                }catch (e) {

                }
            }
            await DB("teams").where("id", team_id).delete();
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Team not deleted.'});
        }

        return res.send({id: team.id, message: "Team with this id " + team_id + " deleted successfully."});
    }

}

module.exports = TeamsController;