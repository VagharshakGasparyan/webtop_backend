const Joi = require('joi');
const {conf} = require("../config/app_config");
const {DB} = require('./db');

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
    array(){
        this._sequence.push({array: 'array'});
        return this;
    }
    arrayEach(){
        this._sequence.push({arrayEach: 'arrayEach'});
        return this;
    }
    min(n){
        this._sequence.push({min : n});
        return this;
    }
    max(n){
        this._sequence.push({max : n});
        return this;
    }
    unique(table, column, without = null){
        this._sequence.push({unique : {table, column, without}});
        return this;
    }
    file(){
        this._sequence.push({file: 'file'});
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
                continue;
            }
            if(val === undefined){
                if(seqKey === 'required'){
                    this.#_pushErr(key, 'The ' + key + ' is required.');
                    continue;
                }
            }else{
                if(seqKey === 'array'){
                    hasArray = true;
                    if(!Array.isArray(val)){
                        this.#_pushErr(key, 'The ' + key + ' is not an array.');
                    }
                    continue;
                }
                if(seqKey === 'arrayEach'){
                    hasArrayEach = true;
                    continue;
                }
                if(seqKey === 'unique'){
                    await this.#_unique(key, val, seqVal);
                    continue;
                }
                if(seqKey === 'min'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_min(key, val[i1], seqVal, hasNumeric, false, i1);
                        }
                    }else{
                        this.#_min(key, val, seqVal, hasNumeric, hasArray);
                    }
                    continue;
                }
                if(seqKey === 'max'){
                    if(hasArrayEach && Array.isArray(val)){
                        for(let i1 = 0; i1 < val.length; i1++){
                            this.#_max(key, val[i1], seqVal, hasNumeric, false, i1);
                        }
                    }else{
                        this.#_max(key, val, seqVal, hasNumeric, hasArray);
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

        console.log(this._sequence);
        console.log(this._errors);
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
    async #_unique(key, val, seqVal, index = null){
        let exists = await DB(seqVal.table).where(seqVal.column, val).when(seqVal.without, function (query) {
            query.where(seqVal.column, '<>', seqVal.without);
        }).exists();
        if(exists){
            this.#_pushErr(key, 'The ' + key + (index === null ? '' : '[' + index + ']') + ' with this value ' + val + ' already exists.');
        }
    }
    #_min(key, val, seqVal, hasNumeric, hasArray, index = null){
        if(hasNumeric){
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
    #_max(key, val, seqVal, hasNumeric, hasArray, index = null){
        if(hasNumeric){
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


module.exports = {validate, api_validate, unique, VRequest};