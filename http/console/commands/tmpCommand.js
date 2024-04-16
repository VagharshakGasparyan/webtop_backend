const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {nodeCommand} = require("../kernel");
const path = require('node:path');
const TeamsResource = require('../../resources/teamsResource');
const {VRequest} = require('../../../components/validate');
class TmpCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "tmp";
    async handle()
    {
        let req = {
            body: {
                user_id: '1',
                levels: '105.6',
                gallery: ['qwerty', 'asd'],
                nmb: '125.785'
            },
            files: null
        }
        let errors = await new VRequest(req, 'res')
            .key('user_id').unique('users', 'id', 5).min(1).max(7)
            .key('levels').integer().min(0).max(100).required()
            .key('zmbrdm').required()
            .key('gallery').array().arrayEach()
            .key('nmb').number()
            .validate()
        ;
        // console.log(errors);




    }
}

module.exports = TmpCommand;