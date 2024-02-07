const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");

class TeamsResource {
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

        return {
            "id": r.id,
            "first_name": r.first_name,
            "last_name": r.last_name,
            "image": r.image,
            "images": r.images ? JSON.parse(r.images) : r.images,
            "rank": r.rank ? tr(JSON.parse(r.rank), this.local) : r.rank,
            "title": r.title ? tr(JSON.parse(r.title), this.local) : r.title,
            "description": r.description ? tr(JSON.parse(r.description), this.local) : r.description,
            "active": r.active,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
    }

    async collection(resource) {
        let aArr = [];
        for(let r of resource){
            aArr.push(await this.index(r));
        }
        return aArr;
    }
}

module.exports = TeamsResource;