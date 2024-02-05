const {DB} = require("../../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
class QwertyCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "qwerty";
    async handle()
    {
        console.log(this.args);
    }
}

module.exports = QwertyCommand;