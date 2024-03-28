const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {unique, api_validate} = require("../../components/validate");
const Joi = require("joi");
const {generateString} = require("../../components/functions");
const {extFrom} = require("../../components/mimeToExt");
const md5 = require("md5");
const CategoriesResource = require("../resources/categoriesResource");
const controllersAssistant = require("../../components/controllersAssistant");
class CategoriesController {
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
        let translatable = ['name'];
        let newData = {};
        let errors = [];
        controllersAssistant.translateAblesCreate(req, res, translatable, newData, errors);
        if(errors.length){
            res.status(422);
            return res.send({errors: errors});
        }
        try {
            newData.created_at = moment().format('yyyy-MM-DD HH:mm:ss');
            newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
            let forId = await DB('categories').create(newData);
            newData.id = forId.insertId;
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Category not created.'});
        }
        let category = await new CategoriesResource(newData, locale);
        return res.send({data: {category: category, message: 'Category created successfully.'}, errors: {}});
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
        let {category_id} = req.params;
        let category = null;
        if(!category_id){
            res.status(422);
            return res.send({errors: 'No category id parameter.'});
        }

        let newData = {};
        let locale = res.locals.$api_local;
        try {
            category = await DB('categories').find(category_id);
            if(!category){
                res.status(422);
                return res.send({errors: "Category with this id " + category_id + " can not found."});
            }
            let translatable = ['name'];
            controllersAssistant.translateAblesUpdate(req, res, translatable, newData, category);
            if(Object.keys(newData).length > 0){
                newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('categories').where("id", category_id).update(newData);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Category not updated.'});
        }
        for(let key in newData){
            category[key] = newData[key];
        }
        category = await new CategoriesResource(category, locale);

        return res.send({data:{category}, message: "Category data updated successfully.", errors: errors});
    }

    async destroy(req, res, next)
    {
        let {category_id} = req.params;
        if(!category_id){
            res.status(422);
            return res.send({errors: 'No category id parameter.'});
        }

        let category = null;
        try {
            category = await DB("categories").find(category_id);
            if(!category){
                res.status(422);
                return res.send({errors: "Category with this id " + category_id + " can not found."});
            }
            await DB("categories").where("id", category_id).delete();
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Category not deleted.'});
        }

        return res.send({id: category.id, message: "Category with this id " + category_id + " deleted successfully."});
    }

}

module.exports = CategoriesController;