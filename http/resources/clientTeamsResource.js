const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");

class ClientTeamsResource {
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
        let translatable = ['first_name', 'last_name', 'rank', 'title', 'description'];
        let resObj = {
            "id": r.id,
            "image": r.image,
            "images": r.images ? JSON.parse(r.images) : []
        };
        translatable.forEach((trField) => {
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

module.exports = ClientTeamsResource;