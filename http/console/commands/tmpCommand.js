const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {nodeCommand} = require("../kernel");
const path = require('node:path');
const TeamsResource = require('../../resources/teamsResource');
const {ValidateClass, V} = require('../../../components/validate');
class TmpCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "tmp";
    async handle()
    {




    }
}

module.exports = TmpCommand;