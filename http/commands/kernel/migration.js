const {DB} = require("../../../components/db");
const table = "users";

class Migration/*migration-separator*/ {
    constructor() {
        //
    }

    async up() {
        await DB(table).createTable([
            DB.column('id').id(),
            DB.column('created_at').timestamp().nullable(),
            DB.column('updated_at').timestamp().nullable(),
        ]);
    }

    async down() {
        await DB(table).deleteTable();
    }
}