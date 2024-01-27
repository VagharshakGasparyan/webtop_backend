const mysql = require('mysql');
const mysql2 = require('mysql2');

function fDB(q) {
    return new Promise((resolve, reject) => {
        let con = mysql.createConnection({
            host: "localhost",
            user: "root",
            port: 3306,
            password: "",
            database: "webtop_db"
        });
        con.connect(function (err) {
            if (err) {
                reject(err);
            }
            con.query(q, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
}

class DBClass {
    //"SELECT * FROM products WHERE disable = 0 LIMIT 10"
    constructor(table) {
        this._table = "`" + table + "`";
        this._from = "FROM";
        this._conditions = [];
        this._orders = [];
        this._limit = null;
        this._paginate = null;
        this._del_sel_upd = "SELECT";
        this._columns = null;
        this._set = null;
    }

    where(column, condOrVal, val) {
        if (arguments.length < 2) {
            return this;
        }
        if (arguments.length < 3) {
            this._conditions.push("AND", "`" + column + "`", "=", "'" + (typeof condOrVal === "boolean" ? (condOrVal ? 1 : 0) : condOrVal) + "'");
        } else {
            this._conditions.push("AND", "`" + column + "`", condOrVal, "'" + (typeof val === "boolean" ? (val ? 1 : 0) : val) + "'");
        }
        return this;
    }

    orWhere(column, condOrVal, val) {
        if (arguments.length < 2) {
            return this;
        }
        if (arguments.length < 3) {
            this._conditions.push("OR", "`" + column + "`", "=", "'" + (typeof condOrVal === "boolean" ? (condOrVal ? 1 : 0) : condOrVal) + "'");
        } else {
            this._conditions.push("OR", "`" + column + "`", condOrVal, "'" + (typeof val === "boolean" ? (val ? 1 : 0) : val) + "'");
        }
        return this;
    }

    whereIn(column, arr) {
        if (arguments.length < 2 || !Array.isArray(arr)) {
            return this;
        }
        arr = arr.map((ar, i) => {
            return "'" + ar + "'";
        });
        this._conditions.push("AND", "`" + column + "`", "IN(", arr.join(", ") + ")");
        return this;
    }

    orWhereIn(column, arr) {
        if (arguments.length < 2 || !Array.isArray(arr)) {
            return this;
        }
        arr = arr.map((ar, i) => {
            return "'" + ar + "'";
        });
        this._conditions.push("OR", "`" + column + "`", "IN(", arr.join(", ") + ")");
        return this;
    }

    orderBy(column, ascOrDesc = "ASC") {
        if(arguments.length < 2 || (ascOrDesc.toUpperCase() !== "ASC" && ascOrDesc.toUpperCase() !== "DESC")){
            return this;
        }
        this._orders.push("`" + column + "` " + ascOrDesc.toUpperCase());
        return this;
    }

    limit(n) {
        if (n !== undefined) {
            this._limit = n;
        }
        return this;
    }
    paginate(page, perPage) {
        if(page && perPage){
            this._paginate = {page, perPage};
        }
        return this;
    }

    get(columns = "*") {
        if (Array.isArray(columns)) {
            columns = columns.map(col => "`" + col + "`").join(', ');
        }
        this._columns = columns;
        return this._queryBuilder();
    }

    delete(){
        this._columns = null;
        this._del_sel_upd = "DELETE";
        return this._queryBuilder();
    }

    update(obj = {}){
        this._from = null;
        this._set = "SET";
        if(typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0){
            this._set = [];
            this._del_sel_upd = "UPDATE";
            for(let column in obj){
                this._set.push("`" + column + "` = '" + obj[column] + "'");
            }
            this._set = this._set.join(", ");
            this._set = "SET " + this._set;
        }
        return this._queryBuilder();
    }

    find(){

    }

    first(){

    }

    exists(){

    }

    _queryBuilder(){
        let qArr = [];
        qArr.push(this._del_sel_upd);
        this._columns ? qArr.push(this._columns) : null;
        this._from ? qArr.push(this._from) : null;
        qArr.push(this._table);
        this._set ? qArr.push(this._set) : null;
        if (this._conditions.length > 0) {
            this._conditions[0] = "WHERE";
            qArr.push(...this._conditions);
        }
        if(this._orders.length > 0){
            qArr.push("ORDER BY");
            qArr.push(this._orders.join(", "));
        }
        if (this._limit !== null) {
            qArr.push("LIMIT " + this._limit);
        }
        if(this._paginate !== null){
            if (this._limit === null) {
                qArr.push("LIMIT " + this._paginate.perPage);
            }
            qArr.push("OFFSET " + this._paginate.perPage * (this._paginate.page - 1));
        }
        console.log('q=', qArr.join(" "));
        return fDB(qArr.join(" "));
    }
}

function DB(table) {
    return new DBClass(table);
}

// exports.fDB=fDB;
module.exports = {fDB, DB};