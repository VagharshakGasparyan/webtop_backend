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
            client_avatar: Joi.string().min(2).max(512).required(),
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
        let {title, client_avatar, client_name, client_description, client_social, first_info_description,
            first_info_title, second_info_description, second_info_title, categories} = req.body;
        let {background, image, gallery} = req.files ?? {background: null, image: null, gallery: null};
        let portfolioData = {client_avatar, client_name};

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
            portfolioData.id = forId.insertId;
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
        //
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