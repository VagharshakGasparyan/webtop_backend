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

class ValidateClass {
    constructor(req, fn) {
        this._req = req;
        this._body = req.body;
        this._files = req.files;
        let answer = fn(this);

        return answer;
    }
    number(){
        return this;
    }
    integer(){

    }
    string(){

    }
    required(){

    }
    array(){

    }
    min(n){

    }
    max(n){

    }
    unique(table, column){

    }
}

async function V(req, res, validationErrors, dataObj) {
    let types = [
        'number', 'integer', 'float', 'positive', 'negative', 'boolean', 'string', 'array', 'json', 'required',
        'file', 'min', 'max', 'unique', 'in', 'array_min', 'array_max', 'or', '', '', '', '',
        '', '', '', '', '', '', '', '', '', '', '', ''
    ];

    let body = req.body ?? {};
    let files = req.files ?? {};
    return {
        item(reqKey){

        },

    };




}

module.exports = {validate, api_validate, unique, ValidateClass, V};