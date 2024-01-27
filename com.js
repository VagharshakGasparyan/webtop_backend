const {DB} = require("./components/db");
async function f(){
    let l = await DB('sessions').where('role', 'admin').get();
    console.log(l);

    // let d = await DB('sessions').where('role', 'admin').delete();
    // console.log(d);

    let u = await DB('sessions').where('role', 'admin')
        .update({
        token: "zprti_token",
        role: "geghci",
    });
    console.log(u);
    process.exit(1);
}

f();