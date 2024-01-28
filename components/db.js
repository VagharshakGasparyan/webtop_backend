const mysql = require('mysql');
const mysql2 = require('mysql2');


function _val(value) {
    if(value === null){
        return "NULL";
    }else if(typeof value === 'boolean'){
        return value ? 1 : 0;
    }else if(value === undefined){
        return '';
    }
    return "'" + value + "'";
}

function _col(column) {
    return "`" + column + "`";
}

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
        this._table = _col(table);
        this._r_table = null;
        this._table_r = null;
        this._conditions = [];
        this._orders = [];
        this._limit = null;
        this._paginate = null;
        this._add_to_end = null;
    }

    where(column, condOrVal, val) {
        if (arguments.length < 2) {
            return this;
        }
        if (arguments.length < 3) {
            this._conditions.push("AND", _col(column), "=", _val(condOrVal));
        } else {
            this._conditions.push("AND", _col(column), condOrVal,  _val(val));
        }
        return this;
    }

    orWhere(column, condOrVal, val) {
        if (arguments.length < 2) {
            return this;
        }
        if (arguments.length < 3) {
            this._conditions.push("OR", _col(column), "=", _val(condOrVal));
        } else {
            this._conditions.push("OR", _col(column), condOrVal,  _val(val));
        }
        return this;
    }

    whereIn(column, arr) {
        if (arguments.length < 2 || !Array.isArray(arr)) {
            return this;
        }
        arr = arr.map((ar, i) => {
            return _val(ar);
        });
        this._conditions.push("AND", _col(column), "IN(", arr.join(", ") + ")");
        return this;
    }

    orWhereIn(column, arr) {
        if (arguments.length < 2 || !Array.isArray(arr)) {
            return this;
        }
        arr = arr.map((ar, i) => {
            return _val(ar);
        });
        this._conditions.push("OR", _col(column), "IN(", arr.join(", ") + ")");
        return this;
    }

    orderBy(column, ascOrDesc = "ASC") {
        if(arguments.length < 2 || (ascOrDesc.toUpperCase() !== "ASC" && ascOrDesc.toUpperCase() !== "DESC")){
            return this;
        }
        this._orders.push(_col(column)  + " " + ascOrDesc.toUpperCase());
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
            columns = columns.map(col => _col(col)).join(', ');
        }
        this._r_table = "SELECT " + columns + " FROM";
        return this._queryBuilder();
    }

    delete(){
        this._r_table = "DELETE FROM";
        return this._queryBuilder();
    }

    update(obj = {}){
        this._r_table = "UPDATE";
        this._table_r = "SET";
        let set = [];
        if(typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0){
            for(let column in obj){
                set.push(_col(column) + " = " + _val(obj[column]));
            }
            this._table_r = "SET " + set.join(", ");
        }
        return this._queryBuilder();
    }

    create(obj = {}){
        this._r_table = "INSERT INTO";
        if(Array.isArray(obj) && obj.length > 0){
            let columns = [], all_values = [];
            for(let column in obj[0]){
                columns.push(column);
            }
            obj.forEach((objItem)=>{
                let values = [];
                columns.forEach((column)=>{
                    values.push(_val(objItem[column]));
                });
                all_values.push("(" + values.join(", ") + ")");
            });
            this._table_r = "(" + columns.join(", ") + ") VALUES " + all_values.join(", ");
        }else if(typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0){
            let columns = [], values = [];
            for(let column in obj){
                columns.push(_col(column));
                values.push(_val(obj[column]));
            }
            this._table_r = "(" + columns.map(column => _col(column)).join(", ") + ") VALUES (" + values.join(", ") + ")";
        }
        return this._queryBuilder();
    }

    async find(id, columns = "*"){
        if (Array.isArray(columns)) {
            columns = columns.map(col => _col(col)).join(', ');
        }
        this._r_table = "SELECT " + columns + " FROM";
        this._limit = 1;
        if(arguments.length > 0 && id !== undefined && isFinite(id)){
            this._conditions.push("AND", _col('id'), "=", _val(id));
        }
        let answer = await this._queryBuilder();
        return answer.length > 0 ? answer[0] : null;
    }

    async first(columns = "*"){
        if (Array.isArray(columns)) {
            columns = columns.map(col => _col(col)).join(', ');
        }
        this._r_table = "SELECT " + columns + " FROM";
        this._limit = 1;
        let answer = await this._queryBuilder();
        return answer.length > 0 ? answer[0] : null;
    }

    async count(){
        this._r_table = "SELECT COUNT(*) FROM";
        let answer = await this._queryBuilder();
        return answer[0][Object.keys(answer[0])[0]];
    }

    async exists(){
        this._r_table = "SELECT EXISTS (SELECT * FROM";
        this._add_to_end = ")";
        let answer = await this._queryBuilder();
        return answer[0][Object.keys(answer[0])[0]] !== 0;
    }

    async sum(column){
        this._r_table = "SELECT SUM(" + _col(column) + ") FROM";
        let answer = await this._queryBuilder();
        return answer[0][Object.keys(answer[0])[0]];
    }

    truncate(){
        this._r_table = "TRUNCATE TABLE";
        return this._queryBuilder();
    }

    whereHas(){

    }

    _queryBuilder(){
        let qArr = [this._r_table, this._table];
        this._table_r !== null ? qArr.push(this._table_r): null;
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
        }else if(this._paginate !== null){
            qArr.push("LIMIT " + this._paginate.perPage);
        }
        if(this._paginate !== null){
            qArr.push("OFFSET " + this._paginate.perPage * (this._paginate.page - 1));
        }
        this._add_to_end !== null ? qArr.push(this._add_to_end): null;
        let q = qArr.join(" ");
        console.log('q=', q);
        return fDB(q);
    }
}

function DB(table) {
    return new DBClass(table);
}

// exports.fDB=fDB;
module.exports = {fDB, DB};