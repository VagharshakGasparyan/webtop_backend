const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
class TeamsController {
    constructor() {
        //
    }
    async index(req, res, next)
    {
        return res.send({message: "index"});
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

module.exports = {TeamsController};