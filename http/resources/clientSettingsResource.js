const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {conf} = require("../../config/app_config");

class ClientSettingsResource {
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
        };
        translatable.forEach((trField)=>{
            resObj[trField] = r[trField] ? JSON.parse(r[trField]) : {};
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

module.exports = ClientSettingsResource;