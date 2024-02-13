const {DB} = require("../../components/db");
const {api_validate, unique} = require("../../components/validate");
const Joi = require("joi");
const {extFrom} = require("../../components/mimeToExt");
const {generateString} = require("../../components/functions");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
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
            newSettingsData = {
                key: req.body.key,
                name: req.body.name,
                description: JSON.stringify({[locale]: req.body.description}),
                value: req.body.value,
                file: fileName,
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            }
            if("active" in req.body){
                newSettingsData.active = req.body.active;
            }
            await DB('settings').create(newSettingsData);
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Setting not created.'});
        }

        return res.send({data: {settings: newSettingsData, message: message}, errors: {}});
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

module.exports = SettingsController;