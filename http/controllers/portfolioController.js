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
const controllersAssistant = require("../../components/controllersAssistant");
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
            client_name: Joi.string().min(2).max(255).required(),
            categories: Joi.string().min(2).max(2024).required(),
        }, req, res);
        // return res.send({tmp: 'ok'});
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let locale = res.locals.$api_local;
        let {client_name, categories} = req.body;
        let client_social = {}, has_client_social = false;
        for(let key in req.body){
            if(key.startsWith('client_social_') && key.length > 'client_social_'.length){
                let myKey = key.slice('client_social_'.length);
                client_social[myKey] = req.body[key];
                has_client_social = true;
            }
        }
        if(!has_client_social){
            res.status(422);
            return res.send({errors: 'The client_social attribute is required.'});
        }
        let newData = {client_name, client_social: JSON.stringify(client_social)};

        let errors = [];
        try {
            controllersAssistant.filesCreate(
                req, res, ['client_avatar', 'image', 'background'], ['gallery'], 'storage/uploads/portfolio',
                ['.jpeg', '.jpg', '.png'], newData, errors
            );
            controllersAssistant.translateAblesCreate(req, res,
                ['title', 'client_description', 'first_info_description', 'first_info_title', 'second_info_description', 'second_info_title'],
                newData, errors);
            if(errors.length){
                res.status(422);
                return res.send({errors: errors});
            }
            if("active" in req.body){
                newData.active = req.body.active;
            }else{
                newData.active = 1;
            }
            newData.created_at = moment().format('yyyy-MM-DD HH:mm:ss');
            newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
            let forId = await DB('portfolio').create(newData);
            let id = forId.insertId;
            newData.id = id;

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
        let portfolio = await new PortfolioResource(newData, locale);
        return res.send({data: {portfolio: portfolio}, message: "Portfolio created successfully.", errors: []});
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
            client_name: Joi.string().min(2).max(255),
            categories: Joi.string().min(2).max(2024),
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let locale = res.locals.$api_local;
        let {title, client_name, categories, gallery_stay} = req.body;
        let client_social = {}, has_client_social = false;
        for(let key in req.body){
            if(key.startsWith('client_social_') && key.length > 'client_social_'.length){
                let myKey = key.slice('client_social_'.length);
                client_social[myKey] = req.body[key];
                has_client_social = true;
            }
        }

        let {background, image, gallery, client_avatar} = req.files ?? {background: null, image: null, gallery: null, client_avatar: null};
        let newData = {};
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
                newData.client_social = JSON.stringify(client_social);
            }
            if('active' in req.body){
                newData.active = req.body;
            }
            let translatable = ['title', 'client_description', 'first_info_description', 'first_info_title', 'second_info_description', 'second_info_title'];
            controllersAssistant.translateAblesUpdate(req, res, translatable, newData, portfolio);
            if(client_name){
                newData.client_name = client_name;
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
                        newData.background = background;
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
                        newData.image = image;
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
                        newData.client_avatar = client_avatar;
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
            newData.gallery = [];
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
                    return res.send({errors: 'Gallery image not uploaded.'});
                }
                img = 'storage/uploads/portfolio/' + imageName + ext;
                newData.gallery.push(img);
            }

            let oldGallery = portfolio.gallery ? JSON.parse(portfolio.gallery) : [];
            gallery_stay = gallery_stay ? (Array.isArray(gallery_stay) ? gallery_stay : JSON.parse(gallery_stay)) : [];
            for(let oldGalleryImage of oldGallery){
                if(gallery_stay.includes(oldGalleryImage)){
                    newData.gallery.push(oldGalleryImage);
                }else{
                    filesToBeDelete.push(oldGalleryImage);
                }
            }
            if (newData.gallery.length < 1) {
                delete newData.gallery;
            } else {
                newData.gallery = JSON.stringify(newData.gallery);
            }

            for(let fileToBeDelete of filesToBeDelete){
                try {
                    fs.unlinkSync(__basedir + "/public/" + fileToBeDelete);
                }catch (e) {
                    // console.log(e);
                }
            }
            categories = categories ? JSON.parse(categories): [];
            if(categories.length > 0){
                try {
                    await DB('portfolio_category').where('portfolio_id', portfolio_id).delete();
                    await DB('portfolio_category').create(categories.map((category_id)=>{return {portfolio_id: portfolio_id, category_id: category_id}}));
                }catch (e) {

                }
            }
            if(Object.keys(newData).length > 0){
                newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('portfolio').where("id", portfolio_id).update(newData);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Portfolio not updated.'});
        }

        for(let key in newData){
            portfolio[key] = newData[key];
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