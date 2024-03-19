const {DB} = require("../components/db");
const table = "portfolio";//change as you see fit․

class PortfolioMigration {
    constructor() {
        //
    }

    async up() {
        await DB(table).createTable([
            DB.column('id').id(),
            DB.column('title').json().nullable(),
            DB.column('client_avatar').varchar(255).nullable(),
            DB.column('client_name').varchar(255).nullable(),
            DB.column('client_description').json().nullable(),
            DB.column('client_social').json().nullable(),
            DB.column('first_info_description').json().nullable(),
            DB.column('first_info_title').json().nullable(),
            DB.column('second_info_description').json().nullable(),
            DB.column('second_info_title').json().nullable(),
            // DB.column('categories').json().nullable(), //categories: ['web', 'mobile'],
            DB.column('image').varchar(255).nullable(),
            DB.column('gallery').json().nullable(),
            DB.column('background').varchar(255).nullable(),
            DB.column('active').tinyint().default(1),
            DB.column('created_at').timestamp().nullable(),
            DB.column('updated_at').timestamp().nullable(),
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
}module.exports = PortfolioMigration;