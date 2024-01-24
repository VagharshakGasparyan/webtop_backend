const fs = require("node:fs");
const {conf} = require("../config/app_config");
const {makeDirectoryIfNotExists} = require("./functions");
const {translations} = require("./translations");

module.exports = (dirname) => {
    global.__basedir = dirname;
    global.saveFileContent = (path, fileName, fileData) => {
        try {
            let fullPath = __basedir + '/public/' + path;
            makeDirectoryIfNotExists(fullPath);
            fs.writeFileSync(fullPath + '/' + fileName, fileData );
            return true;
        }catch (e) {
            console.error(e);
            return false;
        }
    };
    global.tr = (w, lang) => {
        return w in translations && lang in translations[w] ? translations[w][lang] : w;
    }
}

