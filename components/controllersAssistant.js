const {DB} = require("./db");
const {api_validate, unique} = require("./validate");
const Joi = require("joi");
const {extFrom} = require("./mimeToExt");
const {generateString} = require("./functions");
const fs = require('node:fs');
const md5 = require("md5");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");

class controllersAssistant {
    constructor() {
        //
    }

    static translateAblesCreate(req, res, translatable, newData, errors)
    {
        let locale = res.locals.$api_local;
        translatable.forEach((t)=>{
            let item = {};
            let has_item = false;
            if(t in req.body){
                item[locale] = req.body[t];
                has_item = true;
            }
            for(let key in req.body){
                if(key.startsWith(t + '_') && key.length > (t + '_').length){
                    let myKey = key.slice((t + '_').length);
                    item[myKey] = req.body[key];
                    has_item = true;
                }
            }
            if(has_item){
                newData[t] = JSON.stringify(item);
            }else{
                errors.push('The ' + t + ' attribute is required.');
            }
        });
    }

    static translateAblesUpdate(req, res, translatable, newData, db_item)
    {
        let locale = res.locals.$api_local;
        translatable.forEach((t)=>{
            let item = db_item[t] ? JSON.parse(db_item[t]) : {};
            if(t in req.body){
                item[locale] = req.body[t];
            }
            for(let key in req.body){
                if(key.startsWith(t + '_') && key.length > (t + '_').length){
                    let myKey = key.slice((t + '_').length);
                    item[myKey] = req.body[key];
                }
            }
            newData[t] = JSON.stringify(item);
        });
    }
}

module.exports = controllersAssistant;