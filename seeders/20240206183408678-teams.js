const {DB} = require("../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const table = "teams";//change as you see fit․
class TeamsSeeder {
    constructor() {
        //
    }

    async up() {
        await DB(table).create([
            {
                first_name: "Poghos",
                last_name: "Poghosyan",
                image: null,
                images: null,
                rank: '{"hy": "React-ի մասնագետ", "en": "React developer", "ru": "Разработчик React"}',
                // title: JSON.stringify({
                //     "hy": "Main React developer",
                //     "en": "Main React developer",
                //     "ru": "Main React developer",
                // }),
                // description: JSON.stringify({
                //     "hy": "Good working.",
                //     "en": "Good working.",
                //     "ru": "Good working.",
                // }),
                active: 1,
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            },
            // {
            //     first_name: "Petros",
            //     last_name: "Petrosyan",
            //     image: null,
            //     images: null,
            //     rank: '\"{"hy": "Laravel developer", "en": "Laravel developer", "ru": "Laravel developer"}\"',
            //     // title: JSON.stringify({
            //     //     "hy": "Main Laravel developer",
            //     //     "en": "Main Laravel developer",
            //     //     "ru": "Main Laravel developer",
            //     // }),
            //     // description: JSON.stringify({
            //     //     "hy": "Good working.",
            //     //     "en": "Good working.",
            //     //     "ru": "Good working.",
            //     // }),
            //     active: 1,
            //     created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            //     updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            // },
            // {
            //     first_name: "Martiros",
            //     last_name: "Martirosyan",
            //     image: null,
            //     images: null,
            //     rank: '{"hy": "HTML, CSS, JS developer", "en": "HTML, CSS, JS developer", "ru": "HTML, CSS, JS developer"}',
            //     // title: JSON.stringify({
            //     //     "hy": "Main HTML, CSS, JS developer",
            //     //     "en": "Main HTML, CSS, JS developer",
            //     //     "ru": "Main HTML, CSS, JS developer",
            //     // }),
            //     // description: JSON.stringify({
            //     //     "hy": "Good working too.",
            //     //     "en": "Good working too.",
            //     //     "ru": "Good working too.",
            //     // }),
            //     active: 1,
            //     created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            //     updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            // }
        ]);
        /*Or can create*/
        /*
        await DB(table).truncate();
        await DB(table).create(
            {
                first_name: 'Root',
                last_name: 'Root',
                email: 'root@mail.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                role: 'admin',
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            },
        );
        */
    }

    async down() {
        await DB(table).truncate();
    }
}module.exports = TeamsSeeder;