const {DB} = require("../components/db");
const table = "teams";//change as you see fit․
class TeamsMigration {
    constructor() {
        //
    }

    async up() {
        await DB(table).createTable([
            DB.column('id').id(),
            DB.column('first_name').json(),
            DB.column('last_name').json().nullable(),
            DB.column('image').varchar(255).nullable(),
            DB.column('images').json().nullable(),
            DB.column('rank').json().nullable(),
            DB.column('title').json().nullable(),
            DB.column('description').json().nullable(),
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
}module.exports = TeamsMigration;