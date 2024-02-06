const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {conf} = require("../../config/app_config");

class SettingsResource {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        this.local = params;// ?? conf.lang.default ?? null;
        return this.index(resource);
    }

    async index(r) {

        return {
            "id": r.id,
            "key": r.key,
            "name": r.name ? tr(JSON.parse(r.name), this.local) : r.name,
            "description": r.description ? tr(JSON.parse(r.description), this.local) : r.description,
            "value": r.value ? JSON.parse(r.value) : r.value,
            "type": r.type,
            "image": r.image,
            "images": r.images ? JSON.parse(r.images) : r.images,
            "active": r.active,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
    }
}

module.exports = SettingsResource;