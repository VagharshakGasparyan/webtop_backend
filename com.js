const moment = require("moment/moment");
const {DB} = require("./components/db");

/*
SELECT column1, column2, ... FROM
table_name;

INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);

DELETE FROM table_name WHERE condition;

UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;


*/




async function f() {
    // let l = await DB('sessions').where('role', 'admin').get(['user_id', 'role']);
    // console.log(l);

    // let d = await DB('sessions').where('user_id', '>', 1).delete();
    // console.log(d);

    // let u = await DB('sessions').where('role', 'admin')
    //     .update({
    //         token: "zprti_token",
    //         role: "geghci",
    //     });
    // console.log(u);


    let c= await DB('sessions').create({
        user_id: 3,
        role: 'admin',
        token: 'newToken123',
        refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
        updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
    });
    console.log(c);


    process.exit(1);
}

f();