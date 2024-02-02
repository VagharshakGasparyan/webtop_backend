const {DB} = require("../components/db");
const bcrypt = require("bcrypt");
const table = "users";//change as you see fit․
class UsersSeeder {
    constructor() {
        //
    }

    async up() {
        await DB(table).create([
            {
                first_name: 'Root',
                last_name: 'Root',
                email: 'root@webtop.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: new Date(),
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date(),
                // refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
                // updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            },
            {
                first_name: 'User',
                last_name: 'User',
                email: 'user@webtop.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: new Date(),
                role: 'user',
                created_at: new Date(),
                updated_at: new Date(),
            }
        ]);
        /*Or can create*/
        /*
        await DB(table).addColumns([
            DB.column('name').varchar().nullable(),
            DB.column('email').varchar().nullable(),
        ]);

        await DB(table).changeColumn(DB.column('name').text());

        await DB(table).deleteColumn("name");
        */
    }

    async down() {
        await DB(table).deleteTable();
    }
}module.exports = UsersSeeder;