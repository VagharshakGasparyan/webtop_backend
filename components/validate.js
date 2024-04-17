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
                if(seqKey === 'unique'){
                    await this.#_unique(key, val, seqVal);
                    continue;
                }
                if(seqKey === 'min'){
                    if(hasNumeric){
                        if(val < seqVal){
                            this.#_pushErr(key, 'The ' + key + ' value less then ' + seqVal + '.');
                        }
                    }else if(hasArray){
                        if(Array.isArray(val) && val.length < seqVal){
                            this.#_pushErr(key, 'The ' + key + ' length is less then ' + seqVal + '.');
                        }
                    }else{//string
                        if(val.length < seqVal){
                            this.#_pushErr(key, 'The ' + key + ' length is less then ' + seqVal + '.');
                        }
                    }
                    continue;
                }
            }




            if(seq && typeof seq === 'object' && !Array.isArray(seq)){//{...}
                if('key' in seq){
                    key  = seq['key'];
                    val = this._body[key];
                    hasArray = false;
                    hasArrayEach = false;
                    hasNumeric = false;
                    hasFile = false;
                }else if(val !== undefined && 'unique' in seq){
                    let exists = await DB(seq.unique.table).where(seq.unique.column, val).when(seq.unique.without, function (query) {
                        query.where(seq.unique.column, '<>', seq.unique.without);
                    }).exists();
                    if(exists){
                        err = 'The ' + key + ' with this value ' + val + ' already exists.';
                        this.#_pushErr(key, err);
                    }
                }else if(val !== undefined && 'min' in seq){
                    if(hasNumeric){
                        if(val < seq.min){
                            err = 'The ' + key + ' value less then ' + seq.min + '.';
                            this.#_pushErr(key, err);
                        }
                    }else if(hasArray){
                        if(Array.isArray(val) && val.length < seq.min){
                            err = 'The ' + key + ' length is less then ' + seq.min + '.';
                            this.#_pushErr(key, err);
                        }
                    }else{//string
                        if(val.length < seq.min){
                            err = 'The ' + key + ' length is less then ' + seq.min + '.';
                            this.#_pushErr(key, err);
                        }
                    }

                }else if(val !== undefined && 'max' in seq){
                    if(hasNumeric){
                        if(val > seq.max){
                            err = 'The ' + key + ' value greater then ' + seq.max + '.';
                            this.#_pushErr(key, err);
                        }
                    }else if(hasArray){
                        if(Array.isArray(val) && val.length > seq.max){
                            err = 'The ' + key + ' length is greater then ' + seq.max + '.';
                            this.#_pushErr(key, err);
                        }
                    }else{//string
                        if(val.length > seq.max){
                            err = 'The ' + key + ' length is greater then ' + seq.max + '.';
                            this.#_pushErr(key, err);
                        }
                    }
                }
            }else if(val !== undefined && seq === 'number'){
                hasNumeric = true;
                if(isNaN(val)){
                    err = 'The ' + key + ' value is not a numeric.';
                    this.#_pushErr(key, err);
                }
            }else if(val !== undefined && seq === 'integer'){
                hasNumeric = true;
                if(!Number.isInteger(parseFloat(val))){
                    err = 'The ' + key + ' value is not an integer.';
                    this.#_pushErr(key, err);
                }
            }else if(val !== undefined && seq === 'array'){
                hasArray = true;
                if(!Array.isArray(val)){
                    err = 'The ' + key + ' is not an array.';
                    this.#_pushErr(key, err);
                }
            }else if(val === undefined && seq === 'required'){
                err = 'The ' + key + ' is required.';
                this.#_pushErr(key, err);
            }
        }
        // this._errors = {a: ['qwerty']};
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
    //----------------------------------------------
}


module.exports = {validate, api_validate, unique, VRequest};