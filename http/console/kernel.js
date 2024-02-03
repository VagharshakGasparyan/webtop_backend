const fs = require('node:fs');
const moment = require("moment/moment");
const {DB} = require('../../components/db');
const {makeDirectoryIfNotExists, getAllFilesAndDirs} = require("../../components/functions");

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
        this.seederPath = root + "/seeders";
        this.controllerPath = root + '/http/controllers';
        this.commandPath = root + '/http/console/commands';
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
            {
                command: "node com make:controller controller1 controller2 ...",
                description: "Make a controller(s) skeleton file(s)."
            },
            {
                command: "node com make:command command1 command2 ...",
                description: "Make a command(s) skeleton file(s)."
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
        // console.log(helpText);
        return helpText;
    }

    async migrate() {
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        let filesOrDirs = fs.readdirSync(this.migrationPath);
        let files = filesOrDirs.filter((fileOrDir)=>{
            return fs.statSync(this.migrationPath + "/" + fileOrDir).isFile() && fileOrDir.endsWith(fileExt);
        });
        let filesObj = files.map((file)=>{
            let time = '', name = '';
            let newFile = file.slice(0, -fileExt.length);
            let index = file.indexOf("-");
            if(index > -1){
                time = newFile.slice(0, index);
                name = newFile.slice(index + 1);
            }
            return {time, name};
        });
        filesObj.sort((a, b)=>{
            return a.time - b.time;
        });
        let filesObjToBeUp = [];
        if(tables.length){
            for(let fileObj of filesObj){
                if(
                    tables.includes(fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name + fileExt)
                ){
                    filesObjToBeUp.push(fileObj);
                }
            }
        }else{
            filesObjToBeUp.push(...filesObj);
        }

        for(let fileObj of filesObjToBeUp){
            try {
                const MyTableClass = require("../../migrations/" + fileObj.time + '-' + fileObj.name);
                await new MyTableClass().up();
                message.push(fileObj.time + '-' + fileObj.name + fileExt);
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Migrating files:");
        }else{
            message.push("Noting to migrate.");
        }
        return message.join(" ");
    }

    async makeMigration() {
        let message = [];
        let fileExt = ".js";
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
                    "const table = \"" + table + "\";//change as you see fit․\nclass " + tableClass;
                mfArr.push("module.exports = " + tableClass + ";");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.migrationPath);
                let fileName = moment().format('yyyyMMDDHHmmssSSS') + '-' + table + fileExt;
                fs.writeFileSync(this.migrationPath + '/' + fileName, mf);
                message.push(fileName);
            }catch (e) {
                console.error(e);
            }
            await sleep(50);
        }
        if(message.length){
            message.unshift("Making migration files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async seed() {
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        let filesOrDirs = fs.readdirSync(this.seederPath);
        let files = filesOrDirs.filter((fileOrDir)=>{
            return fs.statSync(this.seederPath + "/" + fileOrDir).isFile() && fileOrDir.endsWith(fileExt);
        });
        let filesObj = files.map((file)=>{
            let time = '', name = '';
            let newFile = file.slice(0, -fileExt.length);
            let index = file.indexOf("-");
            if(index > -1){
                time = newFile.slice(0, index);
                name = newFile.slice(index + 1);
            }
            return {time, name};
        });
        filesObj.sort((a, b)=>{
            return a.time - b.time;
        });
        let filesObjToBeUp = [];
        if(tables.length){
            for(let fileObj of filesObj){
                if(
                    tables.includes(fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name + fileExt)
                ){
                    filesObjToBeUp.push(fileObj);
                }
            }
        }else{
            filesObjToBeUp.push(...filesObj);
        }

        for(let fileObj of filesObjToBeUp){
            try {
                const MyTableClass = require("../../seeders/" + fileObj.time + '-' + fileObj.name);
                await new MyTableClass().up();
                message.push(fileObj.time + '-' + fileObj.name + fileExt);
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Seeding files:");
        }else{
            message.push("Noting to seed.");
        }
        return message.join(" ");
    }

    async makeSeeder() {
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        for (const table of tables) {
            try {
                let tableClass = table;
                tableClass = tableClass[0].toUpperCase() + tableClass.slice(1);
                tableClass += "Seeder";
                let mf = fs.readFileSync(__dirname + '/kernel/seeder.js', 'utf8');
                let mfArr = mf.split('/*seeder-separator*/');
                mfArr[0] = "const {DB} = require(\"../components/db\");\n" +
                    "const bcrypt = require(\"bcrypt\");\n" +
                    "const moment = require(\"moment/moment\");\n" +
                    "const table = \"" + table + "\";//change as you see fit․\nclass " + tableClass;
                mfArr.push("module.exports = " + tableClass + ";");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.seederPath);
                let fileName = moment().format('yyyyMMDDHHmmssSSS') + '-' + table + fileExt;
                fs.writeFileSync(this.seederPath + '/' + fileName, mf);
                message.push(fileName);
            }catch (e) {
                console.error(e);
            }
            await sleep(50);
        }
        if(message.length){
            message.unshift("Making seeder files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async makeController(){
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        for (let table of tables) {
            try {

                let ii = table.lastIndexOf('/');
                let tableClass = ii > -1 ? table.slice(ii + 1) : table;
                let additionalPath = ii > -1 ? table.slice(0, ii) : '';
                let sl_additionalPath = additionalPath ? "/" + additionalPath : "";
                let additionalPath_sl = additionalPath ? additionalPath + "/" : "";
                table = tableClass;
                let fileName = table + "Controller" + fileExt;
                if(fs.existsSync(this.controllerPath + sl_additionalPath + '/' + fileName)){
                    message.push("(Can not create already exists file " + fileName +")");
                    continue;
                }
                tableClass = tableClass[0].toUpperCase() + tableClass.slice(1);
                tableClass += "Controller";
                let mf = fs.readFileSync(__dirname + '/kernel/controller.js', 'utf8');
                let mfArr = mf.split('/*controller-separator*/');
                mfArr[0] = "const {DB} = require(\"../../components/db\");\n" +
                    "const bcrypt = require(\"bcrypt\");\n" +
                    "const moment = require(\"moment/moment\");\n" +
                    "class " + tableClass;
                mfArr.push("module.exports = {" + tableClass + "};");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.controllerPath + sl_additionalPath);
                fs.writeFileSync(this.controllerPath + sl_additionalPath + '/' + fileName, mf);
                message.push(additionalPath_sl + fileName);
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Making controller files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async makeCommand(){
        let message = [];
        let fileExt = ".js";
        let commands = [];
        for (let i = 1; i < this.args.length; i++) {
            commands.push(this.args[i]);
        }
        for (let command of commands) {
            try {
                let ii = command.lastIndexOf('/');
                let commandClass = ii > -1 ? command.slice(ii + 1) : command;
                let additionalPath = ii > -1 ? command.slice(0, ii) : '';
                let sl_additionalPath = additionalPath ? "/" + additionalPath : "";
                let additionalPath_sl = additionalPath ? additionalPath + "/" : "";
                command = commandClass;
                let fileName = command + "Command" + fileExt;
                if(fs.existsSync(this.commandPath + sl_additionalPath + '/' + fileName)){
                    message.push("(Can not create already exists file " + fileName +")");
                    continue;
                }
                commandClass = commandClass[0].toUpperCase() + commandClass.slice(1);
                commandClass += "Command";
                let mf = fs.readFileSync(__dirname + '/kernel/command.js', 'utf8');
                let mfArr = mf.split('/*command-separator*/');
                mfArr[0] = "const {DB} = require(\"../../../components/db\");\n" +
                    "const bcrypt = require(\"bcrypt\");\n" +
                    "const moment = require(\"moment/moment\");\n" +
                    "class " + commandClass;
                mfArr[2] = "\"" + command + "\"";
                mfArr.push("module.exports = " + commandClass + ";");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.commandPath + sl_additionalPath);
                fs.writeFileSync(this.commandPath + sl_additionalPath + '/' + fileName, mf);
                message.push(additionalPath_sl + fileName);
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Making command files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async launchCommand(){
        let command = this.args[0];
        if(!command){
            return "No command.";
        }
        let commandLaunched = false;
        let files = getAllFilesAndDirs(this.commandPath).files;
        // console.log(files);
        for(let file of files){
            try {
                let slash = file.relativePath ? "/" : "";
                const MyCommandClass = require("./commands/" + file.relativePath + slash + file.file);
                if(MyCommandClass.command !== command){
                    continue;
                }
                await new MyCommandClass(this.args).handle();
                commandLaunched = true;
            }catch (e) {}
        }
        return commandLaunched ? "" : "Command not found or not launched.";
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
                case "make:controller":
                    return await this.makeController();
                case "make:command":
                    return await this.makeCommand();
                default: return await this.launchCommand();
            }
        } else {
            return "No arguments.";
        }
    }


}

module.exports = {Kernel};