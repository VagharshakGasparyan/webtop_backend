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
                    let d = req.body[item] ? JSON.parse(req.body[item]) : {page: 1, perPage: 10};
                    let {page = 1, perPage = 10} = d;
                    let sqlData;
                    let _itemCount = await DB(item).count();
                    let _itemPage = 1;
                    let _itemPerPage = _itemCount;
                    let _lastPage = 1;
                    if(req.body[item]){
                        _itemPage = page;
                        _itemPerPage = perPage;
                        _lastPage = Math.ceil(_itemCount / _itemPerPage);
                        sqlData = await DB(item).paginate(page, perPage).get();
                    }else{
                        sqlData = await DB(item).get();
                    }
                    sendData.data[item] = {
                        data: await new items[item](sqlData, res.locals.$api_local),
                        count: _itemCount,
                        page: _itemPage,
                        perPage: _itemPerPage,
                        lastPage: _lastPage
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