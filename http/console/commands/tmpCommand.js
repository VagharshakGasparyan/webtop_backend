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
                gallery: ['qwerty', 'asd', '5576', 'abcd'],
                nmb: '125.785',
                category_id: '10',
                in_do: '10',
            },
            files: {
                picture: [
                    {name: 'name1.png', data: 'qwerty', size: 1000000, mimetype: 'image/png'},
                    {name: 'name2.png', data: 'qwerty', size: 350000, mimetype: 'application/pdf'},
                    {name: 'name3.png', data: 'qwerty', size: 1000000, mimetype: 'image/png'},
                ],
            }
        }
        let errors = await new VRequest(req, 'res')
            .key('user_id').unique('users', 'id', 5).min(1).max(7)
            .key('levels').integer().min(0).max(100).required()
            .key('zmbrdm').required()
            .key('gallery').array().max(3).arrayEach().number().max(1000)
            .key('nmb').number()
            .key('category_id').exists('categories', 'id')
            .key('picture').array().max(2).arrayEach().image()
            // .max(500000)
            // .mimetypes(['image/jpeg', 'image/png'])
            // .mimes(['.png', '.pdf'])
            .key('in_do').in(['1', '2', '3', '7'])
            .validate()
        ;
        console.log(errors);
/*
        req.files= {
            testFiles: {
                name: 'academy_small.png',
                data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 c8 00 00 00 de 08 06 00 00 00 78 d7 4f 18 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00 00 04 ... 26772 more bytes>,
                size: 26822,
                encoding: '7bit',
                tempFilePath: '',
                truncated: false,
                mimetype: 'image/png',
                md5: '56e1812fe99bed7d222432d4e011057d',
                mv: [Function: mv]
            }
        };
*/

    }
}

module.exports = TmpCommand;