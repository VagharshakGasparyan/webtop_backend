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
            name: Joi.string().min(1).max(512),
            description: Joi.string().min(1),
            value: Joi.string().min(1)
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let message = null;

        let settingFile = req.files ? req.files.file : null;
        let fileName = null;
        if (settingFile) {
            fileName = md5(Date.now()) + generateString(4);
            let ext = extFrom(settingFile.mimetype, settingFile.name);
            let uploaded = saveFileContentToPublic('storage/uploads/settings', fileName + ext, settingFile.data);
            if (!uploaded) {
                res.status(422);
                return res.send({errors: 'file not uploaded.'});
            }
            fileName = 'storage/uploads/settings/' + fileName + ext;
        }
        let newSettingsData = {};
        try {
            let arrDescription = {}, hasLangDescription = false;
            for (let item in req.body){
                if(item.startsWith('description_') && item.length > 'description_'.length){
                    hasLangDescription = true;
                    let itemLang = item.slice('description_'.length);
                    arrDescription[itemLang] = req.body[item];
                }
            }
            newSettingsData = {
                key: req.body.key,
                name: req.body.name,
                description: JSON.stringify( hasLangDescription ? arrDescription : {[locale]: req.body.description}),
                value: req.body.value,
                file: fileName,
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            }
            if("active" in req.body){
                newSettingsData.active = req.body.active;
            }
            let forId = await DB('settings').create(newSettingsData);
            newSettingsData.id = forId.insertId;
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Setting not created.'});
        }
        let setting = await new SettingsResource(newSettingsData, locale);
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
            description: Joi.string().min(1),
            value: Joi.string().min(1)
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let {key, name, description, value, active} = req.body;
        let updatedSettingData = {};
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
                updatedSettingData.key = key;
            }
            if(name){
                updatedSettingData.name = name;
            }
            let arrDescription = {}, hasLangDescription = false;
            for (let item in req.body){
                if(item.startsWith('description_') && item.length > 'description_'.length){
                    hasLangDescription = true;
                    let itemLang = item.slice('description_'.length);
                    arrDescription[itemLang] = req.body[item];
                }
            }
            let oldDescription = setting.description ? JSON.parse(setting.description) : {};
            if(hasLangDescription){
                for(let item in arrDescription){
                    oldDescription[item] = arrDescription[item];
                }
                updatedSettingData.description = JSON.stringify(oldDescription);
            }else if(description){
                oldDescription[locale] = description;
                updatedSettingData.description = JSON.stringify(oldDescription);
            }
            if(value){
                updatedSettingData.value = value;
            }
            if("active" in req.body){
                updatedSettingData.active = active;
            }

            let settingFile = req.files ? req.files.file : null;
            if (settingFile) {
                let settingFileName = md5(Date.now()) + generateString(4);
                let ext = extFrom(settingFile.mimetype, settingFile.name);
                let uploaded = saveFileContentToPublic('storage/uploads/settings', settingFileName + ext, settingFile.data);
                if (!uploaded) {
                    errors.push('File not uploaded.');
                }else{
                    if(setting.file){
                        fs.unlinkSync(__basedir + "/public/" + setting.file);
                    }
                    updatedSettingData.file = 'storage/uploads/settings/' + settingFileName + ext;
                }
            }

            if(Object.keys(updatedSettingData).length > 0){
                updatedSettingData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('settings').where("id", setting_id).update(updatedSettingData);
            }else{
                return res.send({message: 'Nothing to update.'});
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Setting not updated.'});
        }
        for(let key in updatedSettingData){
            setting[key] = updatedSettingData[key];
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