const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {nodeCommand} = require("../kernel");
const path = require('node:path');
const TeamsResource = require('../../resources/teamsResource');
class TmpCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "tmp";
    async handle()
    {
        let a = path.relative(__dirname, __dirname + "/../../../components/db");
        console.log(a);

    }
}

module.exports = TmpCommand;