const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const SettingsResource = require("../resources/settingsResource");
const ClientTeamsResource = require("../resources/clientTeamsResource");
const ClientPortfolioResource = require("../resources/clientPortfolioResource");
const ClientSettingsResource = require("../resources/clientSettingsResource");
const ClientCategoriesResource = require("../resources/clientCategoriesResource");
class ClientController {
    constructor() {
        //
    }

    async client(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let teams = await DB('teams').where("active", 1).get();
            let settings = await DB('settings').where("active", 1).get();
            let portfolios = await DB('portfolio').where("active", 1).get();
            let categories = await DB('categories').get();
            teams = await new ClientTeamsResource(teams, locale);
            settings = await new ClientSettingsResource(settings, locale);
            portfolios = await new ClientPortfolioResource(portfolios, locale);
            categories = await new ClientCategoriesResource(categories, locale);
            return res.send({teams, settings, portfolios, categories});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
        // return res.send({message: "Client data"});
    }

    async teams(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let teams = await DB('teams').where("active", 1).get();
            teams = await new ClientTeamsResource(teams, locale);
            return res.send({teams: teams});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
        // return res.send({message: "Client data"});
    }

    async settings(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let settings = await DB('settings').where("active", 1).get();
            settings = await new ClientSettingsResource(settings, locale);
            return res.send({settings: settings});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
        // return res.send({message: "Client data"});
    }

    async portfolios(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let portfolios = await DB('portfolio').where('active', 1).get();
            portfolios = await new ClientPortfolioResource(portfolios, locale);
            return res.send({portfolios: portfolios});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
        // return res.send({message: "Client data"});
    }

    async categories(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let categories = await DB('categories').get();
            categories = await new ClientCategoriesResource(categories, locale);
            return res.send({categories: categories});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
    }

    async portfolio(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let {portfolio_id} = req.params;
            if(!portfolio_id){
                res.status(422);
                return res.send({errors: 'No portfolio id parameter.'});
            }
            let portfolio = await DB('portfolio').where('active', 1).find(portfolio_id);
            if(!portfolio){
                res.status(422);
                return res.send({errors: 'Portfolio with this id not fount.'});
            }
            portfolio = await new ClientPortfolioResource(portfolio, locale);
            return res.send({portfolio: portfolio});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
    }

    async team(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let {team_id} = req.params;
            if(!team_id){
                res.status(422);
                return res.send({errors: 'No team id parameter.'});
            }
            let team = await DB('teams').where('active', 1).find(team_id);
            if(!team){
                res.status(422);
                return res.send({errors: 'Team with this id not fount.'});
            }
            team = await new ClientTeamsResource(team, locale);
            return res.send({team: team});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
    }

    async setting(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let {setting_id} = req.params;
            if(!setting_id){
                res.status(422);
                return res.send({errors: 'No setting id parameter.'});
            }
            let setting = await DB('settings').where('active', 1).find(setting_id);
            if(!setting){
                res.status(422);
                return res.send({errors: 'Setting with this id not fount.'});
            }
            setting = await new ClientSettingsResource(setting, locale);
            return res.send({setting: setting});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
    }

    async category(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let {category_id} = req.params;
            if(!category_id){
                res.status(422);
                return res.send({errors: 'No category id parameter.'});
            }
            let category = await DB('categories').find(category_id);
            if(!category){
                res.status(422);
                return res.send({errors: 'Category with this id not fount.'});
            }
            category = await new ClientCategoriesResource(category, locale);
            return res.send({category: category});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
    }

    async setting_key(req, res, next){
        try {
            let locale = res.locals.$api_local;
            let {setting_key} = req.params;
            if(!setting_key){
                res.status(422);
                return res.send({errors: 'No setting key parameter.'});
            }
            let setting = await DB('settings').where('active', 1).where('key', setting_key).first();
            if(!setting){
                res.status(422);
                return res.send({errors: 'Setting with this key not fount.'});
            }
            setting = await new SettingsResource(setting, locale);
            return res.send({setting: setting});
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'Server side error.'});
        }
    }

    async create(req, res, next)
    {
        //
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
        //
    }

}

module.exports = ClientController;