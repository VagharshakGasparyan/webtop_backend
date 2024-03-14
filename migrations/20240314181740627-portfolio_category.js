const {DB} = require("../components/db");
const table = "portfolio_category";//change as you see fit․
class Portfolio_categoryMigration {
    constructor() {
        //
    }

    async up() {
        await DB(table).createTable([
            DB.column('portfolio_id').bigint().unsigned().foreign('portfolio', 'id'),
            DB.column('category_id').bigint().unsigned().foreign('categories', 'id')
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
}module.exports = Portfolio_categoryMigration;