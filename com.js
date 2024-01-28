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
    let sum = await DB('sessions').sum('user_id');
    console.log(sum);

    // let tr = await DB('sessions').truncate();
    // console.log(tr);

    // let l = await DB('sessions').where('role', 'admin').get(['user_id', 'role']);
    // console.log(l);

    // let f = await DB('sessions').where('user_id', '>',  1).first(['user_id', 'role', 'token']);
    // console.log(f);

    // let fi = await DB('users').find("1");
    // console.log(fi);

    // let cn = await DB('sessions').where('user_id', '>', 1).count();
    // console.log(cn);

    // let ex = await DB('sessions').where('user_id', '>', 1).exists();
    // console.log(ex);

    // let d = await DB('sessions').where('user_id', '>', 1).delete();
    // console.log(d);

    // let u = await DB('sessions').where('role', 'admin')
    //     .update({
    //         token: "zprti_token",
    //         role: "geghci",
    //     });
    // console.log(u);


    // let c= await DB('sessions').create({
    //     user_id: 4,
    //     role: 'admin',
    //     token: 'newToken4',
    //     // refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
    //     // updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
    // });
    // console.log(c);

    // let ca = await DB('sessions').create(
    //         [
    //             {
    //                 user_id: 1,
    //                 role: 'admin',
    //                 token: 'newToken1',
    //                 refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
    //                 updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
    //             },
    //             {
    //                 user_id: 2,
    //                 role: 'admin',
    //                 token: 'newToken2',
    //                 refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
    //                 updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
    //             },
    //             {
    //                 user_id: 3,
    //                 role: 'admin',
    //                 token: 'newToken3',
    //                 refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
    //                 updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
    //             },
    //         ]
    //     )
    // ;
    // console.log(ca);


    process.exit(1);
}

f();