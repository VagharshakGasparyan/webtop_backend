const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
class UsersResource {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        return this.index(resource);
    }

    async index(r) {

        return {
            "id": r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            email: r.email,
            email_verified_at: r.email_verified_at,
            role: r.role,
            created_at: r.created_at,
            updated_at: r.updated_at,
        };
    }
}

module.exports = UsersResource;