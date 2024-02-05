const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
class TeamsResource {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        return this.index(resource);
    }

    async index(r) {

        return {
            "id": r.id,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
    }
}

module.exports = TeamsResource;