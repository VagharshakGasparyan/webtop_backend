const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const SettingsResource = require("../../resources/settingsResource");
const UsersResource = require("../../resources/UsersResource");
const TeamsResource = require("../../resources/TeamsResource");

class AdminDataController {
    constructor() {
        //
    }
    async index(req, res, next)
    {
        let items = {"settings": SettingsResource, "users": UsersResource, "teams": TeamsResource};
        let sendData = {data: {}, errors: {}};
        for(let item in items){
            if(item in req.body){
                try {
                    // let d = req.body[item] ? JSON.parse(req.body[item]) : {page: 1, perPage: 10};
                    // let {page = 1, perPage = 10} = d;
                    let {page, perPage, id} = req.body[item] ? JSON.parse(req.body[item]) : {};
                    id = Array.isArray(id) ? id : [];
                    let paginate = !!(page || perPage);
                    page = page || 1;
                    perPage = perPage || 100;
                    perPage = Math.min(perPage, 100);
                    let sqlData;
                    let count = await DB(item).when(id.length > 0, function (query) {
                        query.whereIn('id', id);
                    }).count();
                    let lastPage = 1;
                    if(paginate){
                        lastPage = Math.ceil(count / perPage);
                        sqlData = await DB(item).when(id.length > 0, function (query) {
                            query.whereIn('id', id);
                        }).paginate(page, perPage).get();
                    }else{
                        sqlData = await DB(item).get();
                    }
                    sendData.data[item] = {
                        data: await new items[item](sqlData, res.locals.$api_local),
                        count: count,
                        page: page,
                        perPage: perPage,
                        lastPage: lastPage
                    };
                }catch (e) {
                    console.error(e);
                    sendData.data[item] = null;
                    sendData.errors[item] = "Not a correct data or server side error.";
                }
            }
        }
        return res.send(sendData);
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

module.exports = AdminDataController;