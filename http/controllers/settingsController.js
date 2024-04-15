const {DB} = require("../../components/db");
const {api_validate, unique} = require("../../components/validate");
const Joi = require("joi");
const {extFrom} = require("../../components/mimeToExt");
const {generateString} = require("../../components/functions");
const fs = require('node:fs');
const md5 = require("md5");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const SettingsResource = require("../resources/SettingsResource");
const controllersAssistant = require("../../components/controllersAssistant");

class SettingsController {
    constructor() {
        //
    }
    async index(req, res, next)
    {
        return res.send({message: "index"});
    }

    async create(req, res, next)
    {
        let locale = res.locals.$api_local;
        let uniqueErr = await unique('settings', 'key', req.body.key);
        if(uniqueErr){
            res.status(422);
            return res.send({errors: {key: uniqueErr}});
        }
        let valid_err = api_validate({
            key: Joi.string().required(),
            name: Joi.string().min(1).max(512).required(),
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let message = null;
        let newData = {};
        let errors = [];
        try {
            controllersAssistant.translateAblesCreate(req, res, ['description', 'title'], newData, errors);
            controllersAssistant.filesCreate(req, res, ['file'], [], 'storage/uploads/settings', '*', newData, errors);
            if(errors.length){
                res.status(422);
                return res.send({errors: errors});
            }
            newData.key = req.body.key;
            newData.name = req.body.name;
            newData.value = req.body.value;
            newData.created_at = moment().format('yyyy-MM-DD HH:mm:ss');
            newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
            if("active" in req.body){
                newData.active = req.body.active;
            }
            let forId = await DB('settings').create(newData);
            newData.id = forId.insertId;
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Setting not created.'});
        }
        let setting = await new SettingsResource(newData, locale);
        return res.send({data: {setting: setting, message: message}, errors: {}});
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
        let {setting_id} = req.params;
        let setting = null;
        if(!setting_id){
            res.status(422);
            return res.send({errors: 'No setting id parameter.'});
        }
        let locale = res.locals.$api_local;
        let valid_err = api_validate({
            key: Joi.string(),
            name: Joi.string().min(1).max(512),
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let {key, name, description, value, active} = req.body;
        let newData = {};
        try {
            setting = await DB('settings').find(setting_id);
            if(!setting){
                res.status(422);
                return res.send({errors: "Setting with this id " + setting_id + " can not found."});
            }
            if(key && key !== setting.key){
                let uniqueErr = await unique('settings', 'key', key);
                if(uniqueErr){
                    res.status(422);
                    return res.send({errors: {key: uniqueErr}});
                }
                newData.key = key;
            }
            if(name){
                newData.name = name;
            }
            //---------------------------------------------------------------------------------
            let translatable = ['description', 'title'];
            controllersAssistant.translateAblesUpdate(req, res, translatable, newData, setting);
            //---------------------------------------------------------------------------------
            if(value){
                newData.value = value;
            }
            if("active" in req.body){
                newData.active = active;
            }
            controllersAssistant.filesUpdate(req, res, ['file'], [], 'storage/uploads/settings', setting, newData, errors);

            if(Object.keys(newData).length > 0){
                newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('settings').where("id", setting_id).update(newData);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Setting not updated.'});
        }
        for(let key in newData){
            setting[key] = newData[key];
        }
        setting = await new SettingsResource(setting, locale);
        return res.send({data: {setting}, message: "Setting data updated successfully.", errors: errors});
    }

    async destroy(req, res, next)
    {
        let {setting_id} = req.params;
        if(!setting_id){
            res.status(422);
            return res.send({errors: 'No setting id parameter.'});
        }

        let setting = null;
        try {
            setting = await DB("settings").find(setting_id);
            if(!setting){
                res.status(422);
                return res.send({errors: "Setting with this id " + setting_id + " can not found."});
            }
            if(setting.file){
                try {
                    fs.unlinkSync(__basedir + "/public/" + setting.file);
                }catch (e) {

                }
            }
            await DB("settings").where("id", setting_id).delete();
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Setting not deleted.'});
        }
        return res.send({id: setting.id, message: "Setting with this id " + setting_id + " deleted successfully."});
    }

}

module.exports = SettingsController;