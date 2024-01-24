const Joi = require('joi');


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
        // let backURL = req.header('Referer') || '/';
        // return res.redirect(backURL);
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

module.exports = {validate, api_validate};