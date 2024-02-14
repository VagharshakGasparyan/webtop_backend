const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {nodeCommand} = require("../kernel");
const path = require('node:path');
const TeamsResource = require('../../resources/teamsResource');
const {ValidateClass} = require('../../../components/validate');
class TmpCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "tmp";
    async handle()
    {
        let m0 = moment().format('yyyy-MM-DD HH:mm:ss');
        let m1 = moment().subtract(10, 's').format('yyyy-MM-DD HH:mm:ss');
        let m2 = moment().add(10, 's').format('yyyy-MM-DD HH:mm:ss');
        let m3 = moment().add(10, 'm').format('yyyy-MM-DD HH:mm:ss');
        let m4 = moment().add(1, 'h').format('yyyy-MM-DD HH:mm:ss');
        let m5 = moment().add(1, 'day').format('yyyy-MM-DD HH:mm:ss');

        // console.log(m0 > m1);
        // console.log(m1 > new Date());
        // console.log(m1 < new Date());
        // console.log(m0);
        // console.log(m1);
        // console.log(m2);
        // console.log(m3);
        // console.log(m4);
        // console.log(m5);
        let u = "?%2Fgames=";
        let u1 = decodeURIComponent(u);
        let u2 = encodeURI(u);
        console.log(u1, u2);
        // console.log(new Date(new Date('2024-02-14 10:45:01') - 10000));
        // let a = path.relative(__dirname, __dirname + "/../../../components/db");
        // console.log(a);
        // let dir = path.dirname("/users/joe/notes.txt");
        // console.log(dir);
        // let b = new ValidateClass({body: {name: "Name", email: "mail@mail.com"}}, (v)=>{
        //     return {
        //         "name": v.number(),
        //         "email": v.number(),
        //     };
        // });
        // console.log(b);
    }
}

module.exports = TmpCommand;