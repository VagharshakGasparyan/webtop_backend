const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
class UsersResource {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        if(Array.isArray(resource)){
            return this.collection(resource);
        }
        return this.index(resource);
    }

    async index(r) {

        return {
            id: r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            email: r.email,
            photo: r.photo,
            email_verified_at: r.email_verified_at,
            role: r.role,
            created_at: r.created_at,
            updated_at: r.updated_at,
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

module.exports = UsersResource;