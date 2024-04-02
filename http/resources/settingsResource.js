const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {conf} = require("../../config/app_config");

class SettingsResource {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        this.local = params;// ?? conf.lang.default ?? null;
        if(Array.isArray(resource)){
            return this.collection(resource);
        }
        return this.index(resource);
    }

    async index(r) {
        let translatable = ['description', 'title'];
        let resObj = {
            "id": r.id,
            "key": r.key,
            "name": r.name,
            "value": r.value,
            "file": r.file,
            "active": r.active,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
        translatable.forEach((trField)=>{
            let items = r[trField] ? JSON.parse(r[trField]) : {};
            resObj[trField] = items;
            for(let langKey in items){
                resObj[trField + '_' + langKey] = items[langKey];
            }
        });
        return resObj;
    }

    async collection(resource) {
        let aArr = [];
        for(let r of resource){
            aArr.push(await this.index(r));
        }
        return aArr;
    }
}

module.exports = SettingsResource;