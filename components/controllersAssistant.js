const {DB} = require("./db");
const {api_validate, unique} = require("./validate");
const Joi = require("joi");
const {extFrom} = require("./mimeToExt");
const {generateString, makeDirectoryIfNotExists} = require("./functions");
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

    static filesCreate(req, res, files, arrFiles, filesPath, allowedFilesExtensions, newData, errors)
    {
        for(let i = 0; i < files.length; i++){
            let file = files[i];
            try {
                let reqFile = req.files && file in req.files ? req.files[file] : null;
                if(!reqFile){
                    continue;
                }
                let ext = extFrom(reqFile.mimetype, reqFile.name);
                if(Array.isArray(allowedFilesExtensions) && !allowedFilesExtensions.includes(ext.toLowerCase())){
                    errors.push('The file ' + file + ' not a ' + allowedFilesExtensions.join(', ') + ' format.');
                    continue;
                }
                let fileName = md5(Date.now()) + generateString(4) + ext;
                let fullPath = __basedir + '/public/' + filesPath;
                makeDirectoryIfNotExists(fullPath);
                fs.writeFileSync(fullPath + '/' + fileName, reqFile.data);
                newData[file] = filesPath + '/' + fileName;
            }catch (e) {
                errors.push('The file ' + file + ' not uploaded.');
            }
        }

        for(let i = 0; i < arrFiles.length; i++){
            let arrFile = arrFiles[i];
            let dbArrFile = arrFile.endsWith('[]') ? arrFile.slice(0, -'[]'.length) : arrFile;
            let reqFiles = req.files && arrFile in req.files ? req.files[arrFile] : [];
            if(!Array.isArray(reqFiles)){
                reqFiles = [reqFiles];
            }
            let arrFilesData = [];
            for(let j = 0; j < reqFiles.length; j++){
                let reqFile = reqFiles[i];
                try {
                    let ext = extFrom(reqFile.mimetype, reqFile.name);
                    if(Array.isArray(allowedFilesExtensions) && !allowedFilesExtensions.includes(ext.toLowerCase())){
                        errors.push('The file "' + dbArrFile + '[' + j + ']' + '" not a ' + allowedFilesExtensions.join(', ') + ' format.');
                        continue;
                    }
                    let fileName = md5(Date.now()) + generateString(4) + ext;
                    let fullPath = __basedir + '/public/' + filesPath;
                    makeDirectoryIfNotExists(fullPath);
                    fs.writeFileSync(fullPath + '/' + fileName, reqFile.data);
                    arrFilesData.push(filesPath + '/' + fileName);
                }catch (e) {
                    errors.push('The file ' + dbArrFile + '[' + j + ']' + ' not uploaded.');
                }
            }
            newData[dbArrFile] = JSON.stringify(arrFilesData);
        }
    }
}

module.exports = controllersAssistant;