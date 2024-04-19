const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const fs = require('node:fs');
const moment = require("moment/moment");
const {api_validate, VRequest} = require("../../components/validate");
const Joi = require("joi");
const md5 = require("md5");
const {generateString} = require("../../components/functions");
const {extFrom} = require("../../components/mimeToExt");
const TeamsResource = require("../resources/teamsResource");
const controllersAssistant = require("../../components/controllersAssistant");

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
        let valid_err = await new VRequest(req, res)
            .key('image').image().max(5000000)
            .key('images[]').toArray().array().max(10).arrayEach().image().max(5000000)
            .key('rank').min(2).max(512)
            .key('title').min(2).max(512)
            .key('description').min(2).max(512)
            .validate();
        if(valid_err){
            res.status(422);
            return res.send({errors: valid_err});
        }

        let locale = res.locals.$api_local;
        let {first_name, last_name} = req.body;
        let newData = {first_name, last_name};
        let errors = [];
        try {
            controllersAssistant.filesCreate(
                req, res, ['image'], ['images[]'], 'storage/uploads/teams', newData, errors
            );
            controllersAssistant.translateAblesCreate(req, res, ['first_name', 'last_name', 'rank', 'title', 'description'], newData, errors);
            if(errors.length){
                res.status(422);
                return res.send({errors: errors});
            }
            newData.created_at = moment().format('yyyy-MM-DD HH:mm:ss');
            newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
            if("active" in req.body){
                newData.active = req.body.active;
            }
            let forId = await DB('teams').create(newData);
            newData.id = forId.insertId;
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Team not created.'});
        }
        let team = await new TeamsResource(newData, locale);
        return res.send({data: {team: team}, message: "Team created successfully.", errors: errors});
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
        // console.log(req.body);
        // return res.send({ok: 'ok.'});
        let errors = [];
        let {team_id} = req.params;
        let team = null;
        if(!team_id){
            res.status(422);
            return res.send({errors: 'No team id parameter.'});
        }
        // let valid_err = api_validate({
        //     first_name: Joi.string().min(2).max(30),
        //     last_name: Joi.string().min(2).max(30),
        //     rank: Joi.string().min(2).max(512),
        //     title: Joi.string().min(2).max(512),
        //     description: Joi.string().min(2).max(512),
        // }, req, res);
        // if (valid_err) {
        //     res.status(422);
        //     return res.send({errors: valid_err});
        // }
        let {active} = req.body;
        let newData = {};
        let locale = res.locals.$api_local;
        try {
            team = await DB('teams').find(team_id);
            if(!team){
                res.status(422);
                return res.send({errors: "Team with this id " + team_id + " can not found."});
            }
            if("active" in req.body){
                newData.active = active;
            }
            controllersAssistant.filesUpdate(req, res, ['image'], ['images[]'], 'storage/uploads/teams', team, newData, errors);

            let translatable = ['first_name', 'last_name', 'rank', 'title', 'description'];
            controllersAssistant.translateAblesUpdate(req, res, translatable, newData, team);
            if(Object.keys(newData).length > 0){
                newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('teams').where("id", team_id).update(newData);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Team not updated.'});
        }
        for(let key in newData){
            team[key] = newData[key];
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