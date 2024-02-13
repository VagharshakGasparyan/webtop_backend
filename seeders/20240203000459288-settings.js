const {DB} = require("../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const table = "settings";//change as you see fit․
class SettingsSeeder {
    constructor() {
        //
    }

    async up() {
        await DB(table).create(
            {
                key: 'contacts',
                name: 'Contacts',
                description: '{"en": "Our contacts", "hy": "Մեր կոնտակտները", "ru": "Наши контакты"}',
                value: '["077-01-01-01","055-01-01-01","043-01-01-01"]',
                file: null,
                active: true,
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            }
        );
    }

    async down() {
        await DB(table).truncate();
    }
}

module.exports = SettingsSeeder;