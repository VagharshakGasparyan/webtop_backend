const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {unique, api_validate} = require("../../components/validate");
const Joi = require("joi");
const {generateString} = require("../../components/functions");
const {extFrom} = require("../../components/mimeToExt");
const md5 = require("md5");
const CategoriesResource = require("../resources/categoriesResource");
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
        let uniqueErr = await unique('categories', 'name', req.body.name);
        if(uniqueErr){
            res.status(422);
            return res.send({errors: {name: uniqueErr}});
        }
        let valid_err = api_validate({
            name: Joi.string().min(1).max(512).required()
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }

        let categoryData = {};
        try {
            categoryData = {
                name: req.body.name,
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            }
            let forId = await DB('categories').create(categoryData);
            categoryData.id = forId.insertId;
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Category not created.'});
        }
        let category = await new CategoriesResource(categoryData, locale);
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
        let valid_err = api_validate({
            name: Joi.string().min(1).max(512).required()
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let {name} = req.body;
        let updatedCategoryData = {};
        let locale = res.locals.$api_local;
        try {
            category = await DB('categories').find(category_id);
            if(!category){
                res.status(422);
                return res.send({errors: "Category with this id " + category_id + " can not found."});
            }
            if(name && name !== category.name){
                let uniqueErr = await unique('categories', 'name', name);
                if(uniqueErr){
                    res.status(422);
                    return res.send({errors: {name: uniqueErr}});
                }
                updatedCategoryData.name = name;
            }
            if(Object.keys(updatedCategoryData).length > 0){
                updatedCategoryData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('categories').where("id", category_id).update(updatedCategoryData);
            }else{
                return res.send({message: 'Nothing to update.'});
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Category not updated.'});
        }
        for(let key in updatedCategoryData){
            category[key] = updatedCategoryData[key];
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