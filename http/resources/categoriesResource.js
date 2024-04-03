const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
class CategoriesResource {
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
        let translatable = ["name"];
        let resObj = {
            "id": r.id,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
        translatable.forEach((trField)=>{
            let items = r[trField] ? JSON.parse(r[trField]) : {};
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

module.exports = CategoriesResource;