const fs = require('node:fs');
const moment = require("moment/moment");
const {DB} = require('../../components/db');
const {makeDirectoryIfNotExists} = require("../../components/functions");

const com_colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
};

function sleep(t) {
    return new Promise((resolve)=>{
        setTimeout(resolve, t);
    });
}

class Kernel {
    constructor(args, root) {
        this.args = args;
        this.root = root;
        global.__basedir = root;
        this.migrationPath = root + "/migrations";
    }

    async help() {
        let help = [
            {command: "node com migrate", description: "Migrate all."},
            {command: "node com migrate table1 table2 ...", description: "Migrate table1, table2 ... by sequence."},
            {
                command: "node com make:migration table1 table2 ...",
                description: "Make a table1, table2 ... migration(s) skeleton file(s)."
            },
            {command: "node com seed", description: "Seed all."},
            {command: "node com seed table1 table2 ...", description: "Seed table1, table2 ... by sequence."},
            {
                command: "node com make:seeder table1 table2 ...",
                description: "Make a table1, table2 ... seeder(s) skeleton file(s)."
            },
        ];
        let comMaxLen = 0;
        help.forEach((h) => {
            comMaxLen = h.command.length > comMaxLen ? h.command.length : comMaxLen;
        })
        let helpText = help.map((h) => {
            let ws = " ".repeat(comMaxLen - h.command.length);
            return com_colours.fg.green + h.command + ws + com_colours.fg.yellow + " " + h.description;
        }).join("\n") + com_colours.reset;
        console.log(helpText);
    }

    async migrate() {
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        /*
        if(!fs.existsSync(addPath) || !fs.statSync(addPath).isDirectory()){
                fs.mkdirSync(addPath);
            }
        */
        let filesOrDirs = fs.readdirSync(this.migrationPath);
        let files = filesOrDirs.filter((fileOrDir)=>{
            return fs.statSync(this.migrationPath + "/" + fileOrDir).isFile() && fileOrDir.endsWith(".js");
        });
        const {ProductsMigration} = require("../../migrations/20240202141954142-products");
        await new ProductsMigration().up();
        console.log(files);
        for (const table of tables) {

        }
        console.log(tables);
    }

    async makeMigration() {
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        for (const table of tables) {
            try {
                let tableClass = table;
                tableClass = tableClass[0].toUpperCase() + tableClass.slice(1);
                tableClass += "Migration";
                let mf = fs.readFileSync(__dirname + '/kernel/migration.js', 'utf8');
                let mfArr = mf.split('/*migration-separator*/');
                mfArr[0] = "const {DB} = require(\"../components/db\");\n" +
                    "const table = \"" + table + "\";\nclass " + tableClass;
                mfArr.push("module.exports = {" + tableClass + "}");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.migrationPath);
                let fileName = moment().format('yyyyMMDDHHmmssSSS') + '-' + table + '.js';
                fs.writeFileSync(this.migrationPath + '/' + fileName, mf);
            }catch (e) {
                console.error(e);
            }
            await sleep(50);
        }
    }
    async seed() {

    }
    async makeSeeder() {

    }

    async distributor() {
        if (this.args.length > 0) {
            switch (this.args[0]) {
                case "make:seeder":
                    return await this.makeSeeder();
                case "make:migration":
                    return await this.makeMigration();
                case "migrate":
                    return await this.migrate();
                case "seed":
                    return await this.seed();
                case "help":
                    return await this.help();
            }
        } else {
            return "No arguments.";
        }
    }


}

module.exports = {Kernel};