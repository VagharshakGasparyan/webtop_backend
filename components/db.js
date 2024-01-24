const mysql = require('mysql');
const mysql_sync = require('sync-mysql') ;
function DB(q) {
    try {
        const connection = new mysql_sync({
            host: "localhost",
            user: "root",
            port: 3306,
            password: "",
            database: "marketplace_db"
        });
        return connection.query(q);
    }catch (e) {
        return {error: e};
    }
}

module.exports = {DB};