const Joi = require('joi');
const {conf} = require("../config/app_config");
const {DB} = require('./db');
const {extFrom} = require("./mimeToExt");

function validate(schema, req, res) {
    const schema_joi = Joi.object(schema);
    let newSchema = {};
    for (let key in schema) {
        newSchema[key] = req.body[key];
    }
    const joiErrors = schema_joi.validate(newSchema, {abortEarly: false}).error;
    //console.log('validate errors=', joiErrors);
    if (joiErrors) {
        req.session.errors = {};
        joiErrors.details.forEach((err_item) => {
            req.session.errors[err_item.path[0]] = err_item.message;
        });
        return false;
    }
    return true;
}

function api_validate(schema, req, res) {
    let valid_err = {};
    const schema_joi = Joi.object(schema);
    let newSchema = {};
    for (let key in schema) {
        newSchema[key] = req.body[key];
    }
    const joiErrors = schema_joi.validate(newSchema, {abortEarly: false}).error;
    //console.log('validate errors=', joiErrors);
    if (joiErrors) {
        joiErrors.details.forEach((err_item) => {
            valid_err[err_item.path[0]] = err_item.message;
        });
        return valid_err;
    }
    return null;
}

async function unique(table, columnName, columnValue) {
    columnValue = columnValue || columnValue === null ? columnValue : '';
    let exists = true;
    try {
        exists = await DB(table).where(columnName, columnValue).exists();
    }catch (e) {
        console.error(e);
    }
    if (exists) {
        return "The " + columnName + " is already in use";
    }
    return null;
}

class VRequest {
    constructor(req, res) {
        this._req = req;
        this._body = req.body ?? {};
        this._files = req.files ?? {};
        this._sequence = [];
        this._errors = null;
    }

    key(reqKey){
        this._sequence.push({'key' : reqKey});
        return this;
    }
    custom(fn){
        this._sequence.push({custom: fn});
        return this;
    }
    number(){
        this._sequence.push({number: 'number'});
        return this;
    }
    integer(){
        this._sequence.push({integer: 'integer'});
        return this;
    }
    string(){
        this._sequence.push({string: 'string'});
        return this;
    }
    required(){
        this._sequence.push({required: 'required'});
        return this;
    }
    requiredWith(anotherKey){
        this._sequence.push({requiredWith: anotherKey});
        return this;
    }
    toArray(){
        this._sequence.push({toArray: 'toArray'});
        return this;
    }
    array(){
        this._sequence.push({array: 'array'});
        return this;
    }
    arrayEach(){
        this._sequence.push({arrayEach: 'arrayEach'});
        return this;
    }
    min(n){
        this._sequence.push({min: n});
        return this;
    }
    max(n){
        this._sequence.push({max: n});
        return this;
    }
    unique(table, column, without = null){
        this._sequence.push({unique: {table, column, without}});
        return this;
    }
    exists(table, column){
        this._sequence.push({exists: {table, column}});
        return this;
    }
    in(enumerationArray){
        this._sequence.push({in: enumerationArray});
        return this;
    }
    email(){
        this._sequence.push({email: 'email'});
        return this;
    }
    file(){
        this._sequence.push({file: 'file'});
        return this;
    }
    image(){
        this._sequence.push({image: 'image'});
        return this;
    }
    mimetypes(arrMimeTypes){
        this._sequence.push({mimetypes: arrMimeTypes});
        return this;
    }
    mimes(arrMimes){
        this._sequence.push({mimes: arrMimes});
        return this;
    }
    async validate(){
        let key, val, fileVal, err, hasArray = false, hasArrayEach = false, hasNumeric = false, hasFile = false;
        for(let i = 0; i < this._sequence.length; i++){
            let seq = this._sequence[i];
            let seqKey = Object.keys(seq)[0];
            let seqVal = seq[seqKey];

            if(seqKey === 'key'){
                key  = seq['key'];
                val = this._body[key];
                fileVal = this._files[key];
                hasArray = false;
                hasArrayEach = false;
                hasNumeric = false;
                hasFile = false;
                let i1 = i + 1;
                while (i1 < this._sequence.length && Object.keys(this._sequence[i1])[0] !== 'key'){
                    if(Object.keys(this._sequence[i1])[0] === 'file' || Object.keys(this._sequence[i1])[0] === 'image'){
                        val = fileVal;
                        break;
                    }
                    i1++;
                }
                continue;
            }
            if(val === undefined){
                if(seqKey === 'required'){
                    this.#_pushErr(key, 'The ' + key + ' is required.');
                    continue;
                }
                if(seqKey === 'requiredWith'){
                    if(seqVal in this._body){
                        this.#_pushErr(key, 'The ' + key + ' is required with ' + seqVal + '.');
                    }
                    continue;
                }
                if(seqKey === 'custom'){
                    let errFn = (err_message) => {
                        this.#_pushErr(key, err_message);
                    };
                    await seqVal(key, val, errFn);
                }
            }else{
                if(seqKey === 'custom'){
                    let errFn = (err_message) => {
                        this.#_pushErr(key, err_message);
                    };
                    await seqVal(key, val, errFn);
                    continue;
                }
                if(seqKey === 'toArray'){//make val array, if it not same
                    if(!Array.isArray(val)){
                        val = [val];
                    }
                    continue;
                }
                if(seqKey === 'array'){
                    hasArray = true;
                    if(!Array.isArray(val)){
                        this.#_pushErr(key, 'The ' + key + ' is not an array.');
                    }
                    continue;
                }
                if(seqKey === 'arrayEach'){
                    hasArrayEach = true;
                    hasArray = false;
                    continue;
                }
                if(seqKey === 'in'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_in(key, val[i1], seqVal, i1);
                        }
                    }else{
                        this.#_in(key, val, seqVal);
                    }
                    continue;
                }
                if(seqKey === 'email'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_email(key, val[i1], i1);
                        }
                    }else{
                        this.#_email(key, val);
                    }
                    continue;
                }
                if(seqKey === 'file'){
                    hasFile = true;
                    val = fileVal;
                    // if(hasArrayEach && Array.isArray(val)){
                    //     for(let i1 = 0; i1 < val.length; i1++){
                    //         await this.#_file(key, val[i1], seqVal, i1);
                    //     }
                    // }else{
                    //     this.#_file(key, val, seqVal);
                    // }
                    continue;
                }
                if(seqKey === 'image'){
                    hasFile = true;
                    val = fileVal;
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            await this.#_image(key, val[i1], seqVal, i1);
                        }
                    }else{
                        this.#_image(key, val, seqVal);
                    }
                    continue;
                }
                if(seqKey === 'mimetypes'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            await this.#_mimetypes(key, val[i1], seqVal, i1);
                        }
                    }else{
                        this.#_mimetypes(key, val, seqVal);
                    }
                    continue;
                }
                if(seqKey === 'mimes'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            await this.#_mimes(key, val[i1], seqVal, i1);
                        }
                    }else{
                        this.#_mimes(key, val, seqVal);
                    }
                    continue;
                }
                if(seqKey === 'unique'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            await this.#_unique(key, val[i1], seqVal, i1);
                        }
                    }else{
                        await this.#_unique(key, val, seqVal);
                    }
                    continue;
                }
                if(seqKey === 'exists'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            await this.#_exists(key, val[i1], seqVal, i1);
                        }
                    }else{
                        await this.#_exists(key, val, seqVal);
                    }
                    continue;
                }
                if(seqKey === 'min'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_min(key, val[i1], seqVal, hasNumeric, hasArray, hasFile, i1);
                        }
                    }else{
                        this.#_min(key, val, seqVal, hasNumeric, hasArray, hasFile);
                    }
                    continue;
                }
                if(seqKey === 'max'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_max(key, val[i1], seqVal, hasNumeric, hasArray, hasFile, i1);
                        }
                    }else{
                        this.#_max(key, val, seqVal, hasNumeric, hasArray, hasFile);
                    }
                    continue;
                }
                if(seqKey === 'integer'){
                    hasNumeric = true;
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_integer(key, val[i1], i1);
                        }
                    }else{
                        this.#_integer(key, val);
                    }
                    continue;
                }
                if(seqKey === 'number'){
                    hasNumeric = true;
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_number(key, val[i1], i1);
                        }
                    }else{
                        this.#_number(key, val);
                    }
                }


            }

        }

        // console.log(this._sequence);
        // console.log(this._errors);
        return this._errors;
    }
    //private methods-------------------------------
    #_pushErr(key, err){
        if(this._errors){
            if(key in this._errors){
                this._errors[key].push(err);
            }else{
                this._errors[key] = [err];
            }
        }else{
            this._errors = {[key]: [err]};
        }
    }
    #_in(key, val, seqVal, index = null){
        if(!seqVal.includes(val)){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' value not in the range of values listed.');
        }
    }
    #_email(key, val, index = null){
        if(!String(val).toLowerCase().match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' value is not an email.');
        }
    }
    #_file(key, val, seqVal, index = null){
        this.#_pushErr(key, 'The file, the facto.');
    }
    #_image(key, val, seqVal, index = null){
        if(val && typeof val === 'object' && 'mimetype' in val &&  !val.mimetype.startsWith('image/')){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' is not an image.');
        }
    }
    #_mimetypes(key, val, seqVal, index = null){
        if(val && typeof val === 'object' && 'mimetype' in val &&  !seqVal.includes(val.mimetype)){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' file is not of type of ' + seqVal.join(', ') + '.');
        }
    }
    #_mimes(key, val, seqVal, index = null){
        if(val && typeof val === 'object' && 'mimetype' in val && 'name' in val){
            let ext = extFrom(val.mimetype, val.name);
            if(val && typeof val === 'object' && 'mimetype' in val &&  !seqVal.includes(ext)){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' file is not of type of ' + seqVal.join(', ') + '.');
            }
        }
    }
    async #_unique(key, val, seqVal, index = null){
        let exists = await DB(seqVal.table).where(seqVal.column, val).when(seqVal.without, function (query) {
            query.where(seqVal.column, '<>', seqVal.without);
        }).exists();
        if(exists){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' with this value ' + val + ' already exists.');
        }
    }
    async #_exists(key, val, seqVal, index = null){
        let exists = await DB(seqVal.table).where(seqVal.column, val).exists();
        if(!exists){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' has not a correct value.');
        }
    }
    #_min(key, val, seqVal, hasNumeric, hasArray, hasFile, index = null){
        if(hasFile){
            if(val && typeof val === 'object' && 'size' in val && val.size < seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' file size less then ' + seqVal + ' bytes.');
            }
        }else if(hasNumeric){
            if(val < seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' value less then ' + seqVal + '.');
            }
        }else if(hasArray){
            if(Array.isArray(val) && val.length < seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' length is less then ' + seqVal + '.');
            }
        }else{//string
            if(val.length < seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' length is less then ' + seqVal + '.');
            }
        }
    }
    #_max(key, val, seqVal, hasNumeric, hasArray, hasFile, index = null){
        if(hasFile){
            if(val && typeof val === 'object' && 'size' in val && val.size > seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' file size greater then ' + seqVal + ' bytes.');
            }
        }else if(hasNumeric){
            if(val > seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' value greater then ' + seqVal + '.');
            }
        }else if(hasArray){
            if(Array.isArray(val) && val.length > seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' length is greater then ' + seqVal + '.');
            }
        }else{//string
            if(val.length > seqVal){
                this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' length is greater then ' + seqVal + '.');
            }
        }
    }
    #_integer(key, val, index = null){
        if(!Number.isInteger(parseFloat(val))){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' value is not an integer.');
        }
    }
    #_number(key, val, index = null){
        if(isNaN(val)){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' value is not a numeric.');
        }
    }
    //----------------------------------------------
}

function requestValidation(req){
    let _seq = [];
    let vKeys = ['key', 'required'];
    let obj = {key:'',required:''};
    vKeys.forEach((vKey)=>{
        obj[vKey] = function (){
            _seq.push({[vKey]: [...arguments]});
            console.log(_seq);
            return obj;
        };
    })
    return obj;
}


module.exports = {validate, api_validate, unique, VRequest, requestValidation};