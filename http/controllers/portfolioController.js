const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const fs = require('node:fs');
const PortfolioResource = require("../resources/portfolioResource");
const {generateString} = require("../../components/functions");
const {extFrom} = require("../../components/mimeToExt");
const md5 = require("md5");
const {api_validate} = require("../../components/validate");
const Joi = require("joi");
const TeamsResource = require("../resources/teamsResource");
class PortfolioController {
    constructor() {
        //
    }
    async index(req, res, next)
    {
        try {
            
        }catch (e) {
            
        }
        return res.send({message: "index"});
    }

    async create(req, res, next)
    {
        let valid_err = api_validate({
            title: Joi.string().min(2).max(512).required(),
            // client_avatar: Joi.string().min(2).max(512).required(),
            client_name: Joi.string().min(2).max(255).required(),
            client_description: Joi.string().min(2).max(512),
            client_social: Joi.string().min(2).max(512),
            first_info_description: Joi.string().min(2).max(512),
            first_info_title: Joi.string().min(2).max(255),
            second_info_description: Joi.string().min(2).max(512),
            second_info_title: Joi.string().min(2).max(255),
            categories: Joi.string().min(2).max(2024),
            // background: Joi.string().min(2).max(255),
        }, req, res);
        // return res.send({tmp: 'ok'});
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let locale = res.locals.$api_local;
        let {title, client_name, client_description, first_info_description,
            first_info_title, second_info_description, second_info_title, categories} = req.body;
        let client_social = {};
        for(let key in req.body){
            if(key.startsWith('client_social_') && key.length > 'client_social_'.length){
                let myKey = key.slice('client_social_'.length);
                client_social[myKey] = req.body[key];
            }
        }
        let {background, image, gallery, client_avatar} = req.files ?? {background: null, image: null, gallery: null, client_avatar: null};
        let portfolioData = {client_name, client_social: JSON.stringify(client_social)};

        let obj = {title, client_description, first_info_description, first_info_title, second_info_description, second_info_title};
        for(let item in obj){
            if(obj[item]){
                portfolioData[item] = JSON.stringify({
                    [locale]: obj[item]
                });
            }
        }
        // if(title){
        //     portfolioData.title = JSON.stringify({
        //         [locale]: title
        //     });
        // }
        try {
            if("active" in req.body){
                portfolioData.active = req.body.active;
            }
            if(image && !Array.isArray(image)){
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(image.mimetype, image.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
                    res.status(422);
                    return res.send({errors: 'image not a jpg or png.'});
                }
                let uploaded = saveFileContentToPublic('storage/uploads/portfolio', imageName + ext, image.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'image not uploaded.'});
                }
                image = 'storage/uploads/portfolio/' + imageName + ext;
                portfolioData.image = image;
            }
            if(client_avatar && !Array.isArray(client_avatar)){
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(client_avatar.mimetype, client_avatar.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
                    res.status(422);
                    return res.send({errors: 'client_avatar not a jpg or png.'});
                }
                let uploaded = saveFileContentToPublic('storage/uploads/portfolio', imageName + ext, client_avatar.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'client_avatar not uploaded.'});
                }
                client_avatar = 'storage/uploads/portfolio/' + imageName + ext;
                portfolioData.client_avatar = client_avatar;
            }
            if(background && !Array.isArray(background)){
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(background.mimetype, background.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
                    res.status(422);
                    return res.send({errors: 'image not a jpg or png.'});
                }
                let uploaded = saveFileContentToPublic('storage/uploads/portfolio', imageName + ext, background.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'image not uploaded.'});
                }
                background = 'storage/uploads/portfolio/' + imageName + ext;
                portfolioData.background = background;
            }
            if(gallery && !Array.isArray(gallery)){
                gallery = [gallery];
            }
            portfolioData.gallery = [];
            for(let img of gallery ?? []){
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(img.mimetype, img.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                    res.status(422);
                    return res.send({errors: 'Gallery image not a jpg or png.'});
                }
                let uploaded = saveFileContentToPublic('storage/uploads/portfolio', imageName + ext, img.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'image not uploaded.'});
                }
                img = 'storage/uploads/portfolio/' + imageName + ext;
                portfolioData.gallery.push(img);
            }
            if(portfolioData.gallery.length < 1){
                delete portfolioData.gallery;
            }else{
                portfolioData.gallery = JSON.stringify(portfolioData.gallery);
            }
            portfolioData.created_at = moment().format('yyyy-MM-DD HH:mm:ss');
            portfolioData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
            let forId = await DB('portfolio').create(portfolioData);
            let id = forId.insertId;
            portfolioData.id = id;

            categories = categories ? JSON.parse(categories): [];
            if(categories.length > 0){
                try {
                    await DB('portfolio_category').create(categories.map((category)=>{return {portfolio_id: id, category_id: category}}));
                }catch (e) {

                }
            }

        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Portfolio not created.'});
        }
        let portfolio = await new PortfolioResource(portfolioData, locale);
        return res.send({data: {portfolio: portfolio}, message: "Portfolio created successfully.", errors: {}});
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
        let {portfolio_id} = req.params;
        if(!portfolio_id){
            res.status(422);
            return res.send({errors: 'No portfolio id parameter.'});
        }
        let valid_err = api_validate({
            title: Joi.string().min(2).max(512),
            client_name: Joi.string().min(2).max(255),
            client_description: Joi.string().min(2).max(512),
            client_social: Joi.string().min(2).max(512),
            first_info_description: Joi.string().min(2).max(512),
            first_info_title: Joi.string().min(2).max(255),
            second_info_description: Joi.string().min(2).max(512),
            second_info_title: Joi.string().min(2).max(255),
            categories: Joi.string().min(2).max(2024),
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let locale = res.locals.$api_local;
        let {title, client_name, client_description, first_info_description,
            first_info_title, second_info_description, second_info_title, categories, gallery: gallery_stay} = req.body;
        let client_social = {}, has_client_social = false;
        for(let key in req.body){
            if(key.startsWith('client_social_') && key.length > 'client_social_'.length){
                let myKey = key.slice('client_social_'.length);
                client_social[myKey] = req.body[key];
                has_client_social = true;
            }
        }
        let {background, image, gallery, client_avatar} = req.files ?? {background: null, image: null, gallery: null, client_avatar: null};
        let updatedData = {};
        let errors = [];
        let filesToBeDelete = [];
        let portfolio = null;
        try {
            portfolio = await DB('portfolio').find(portfolio_id);
            if(!portfolio){
                res.status(422);
                return res.send({errors: "Portfolio with this id " + portfolio_id + " can not found."});
            }
            if(has_client_social){
                updatedData.client_social = JSON.stringify(client_social);
            }
            if('active' in req.body){
                updatedData.active = req.body;
            }
            if(title){
                let oldValue = portfolio.title ? JSON.parse(portfolio.title) : {};
                oldValue[locale] = title;
                updatedData.title = JSON.stringify(oldValue);
            }
            if(client_description){
                let oldValue = portfolio.client_description ? JSON.parse(portfolio.client_description) : {};
                oldValue[locale] = client_description;
                updatedData.client_description = JSON.stringify(oldValue);
            }
            if(first_info_description){
                let oldValue = portfolio.first_info_description ? JSON.parse(portfolio.first_info_description) : {};
                oldValue[locale] = first_info_description;
                updatedData.first_info_description = JSON.stringify(oldValue);
            }
            if(first_info_title){
                let oldValue = portfolio.first_info_title ? JSON.parse(portfolio.first_info_title) : {};
                oldValue[locale] = first_info_title;
                updatedData.first_info_title = JSON.stringify(oldValue);
            }
            if(second_info_description){
                let oldValue = portfolio.second_info_description ? JSON.parse(portfolio.second_info_description) : {};
                oldValue[locale] = second_info_description;
                updatedData.second_info_description = JSON.stringify(oldValue);
            }
            if(second_info_title){
                let oldValue = portfolio.second_info_title ? JSON.parse(portfolio.second_info_title) : {};
                oldValue[locale] = second_info_title;
                updatedData.second_info_title = JSON.stringify(oldValue);
            }
            if(client_name){
                updatedData.client_name = client_name;
            }

            if(background && !Array.isArray(background)){
                let fileName = md5(Date.now()) + generateString(4);
                let ext = extFrom(background.mimetype, background.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
                    res.status(422);
                    errors.push('background not a jpg or png file.');
                }else{
                    let uploaded = saveFileContentToPublic('storage/uploads/portfolio', fileName + ext, background.data);
                    if (!uploaded) {
                        errors.push('background not uploaded.');
                    }else{
                        background = 'storage/uploads/portfolio/' + fileName + ext;
                        updatedData.background = background;
                        if(portfolio.background){
                            filesToBeDelete.push(portfolio.background)
                        }
                    }
                }
            }
            if(image && !Array.isArray(image)){
                let fileName = md5(Date.now()) + generateString(4);
                let ext = extFrom(image.mimetype, image.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
                    res.status(422);
                    errors.push('background not a jpg or png file.');
                }else{
                    let uploaded = saveFileContentToPublic('storage/uploads/portfolio', fileName + ext, image.data);
                    if (!uploaded) {
                        errors.push('background not uploaded.');
                    }else{
                        image = 'storage/uploads/portfolio/' + fileName + ext;
                        updatedData.image = image;
                        if(portfolio.image){
                            filesToBeDelete.push(portfolio.image)
                        }
                    }
                }
            }
            if(client_avatar && !Array.isArray(client_avatar)){
                let fileName = md5(Date.now()) + generateString(4);
                let ext = extFrom(client_avatar.mimetype, client_avatar.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg"){
                    res.status(422);
                    errors.push('client avatar not a jpg or png file.');
                }else{
                    let uploaded = saveFileContentToPublic('storage/uploads/portfolio', fileName + ext, client_avatar.data);
                    if (!uploaded) {
                        errors.push('client avatar not uploaded.');
                    }else{
                        client_avatar = 'storage/uploads/portfolio/' + fileName + ext;
                        updatedData.client_avatar = client_avatar;
                        if(portfolio.client_avatar){
                            filesToBeDelete.push(portfolio.client_avatar)
                        }
                    }
                }
            }
            if(gallery){
                if(!Array.isArray(gallery)){
                    gallery = [gallery];
                }
            }else{
                gallery = [];
            }
            for(let galleryItem of gallery){

            }


            for(let fileToBeDelete of filesToBeDelete){
                try {
                    fs.unlinkSync(__basedir + "/public/" + fileToBeDelete);
                }catch (e) {
                    // console.log(e);
                }
            }

            if(Object.keys(updatedData).length > 0){
                updatedData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('portfolio').where("id", portfolio_id).update(updatedData);
            }else{
                return res.send({message: 'Nothing to update.'});
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Portfolio not updated.'});
        }

        for(let key in updatedData){
            portfolio[key] = updatedData[key];
        }
        portfolio = await new PortfolioResource(portfolio, locale);
        return res.send({data: {portfolio}, message: "Portfolio data updated successfully.", errors: errors});
    }

    async destroy(req, res, next)
    {
        let {portfolio_id} = req.params;
        if(!portfolio_id){
            res.status(422);
            return res.send({errors: 'No portfolio id parameter.'});
        }

        let portfolio = null;
        try {
            portfolio = await DB("portfolio").find(portfolio_id);
            if(!portfolio){
                res.status(422);
                return res.send({errors: "Portfolio with this id " + portfolio_id + " can not found."});
            }
            let filesToBeDelete = portfolio.gallery ? JSON.parse(portfolio.gallery) : [];
            if(portfolio.image){
                filesToBeDelete.push(portfolio.image);
            }
            if(portfolio.background){
                filesToBeDelete.push(portfolio.background);
            }
            if(portfolio.client_avatar){
                filesToBeDelete.push(portfolio.client_avatar);
            }
            for(let fileToBeDelete of filesToBeDelete){
                try {
                    fs.unlinkSync(__basedir + "/public/" + fileToBeDelete);
                }catch (e) {
                    // console.log(e);
                }
            }
            await DB("portfolio").where("id", portfolio_id).delete();
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Portfolio not deleted.'});
        }

        return res.send({id: portfolio.id, message: "Portfolio with this id " + portfolio_id + " deleted successfully."});
    }

}

module.exports = PortfolioController;