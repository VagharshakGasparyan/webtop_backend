const fs = require("node:fs");
const {conf} = require("../config/app_config");
const {makeDirectoryIfNotExists} = require("./functions");
const {translations} = require("./translations");

module.exports = (dirname) => {
    global.__basedir = dirname;
    global.saveFileContentToPublic = (path, fileName, fileData) => {
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
    // global.tr = (w, lang) => {
    //     return w in translations && lang in translations[w] ? translations[w][lang] : w;
    // }
    global.tr = (w, lang) => {
        let ld = conf.lang.default ?? null;
        let l = lang ?? conf.lang.default ?? null;
        try {
            if(w && typeof w === 'string' && l && typeof l === 'string' && w in translations){
                if(l in translations[w]){
                    return translations[w][l];
                }else if(ld && typeof ld === 'string' && ld in translations[w]){
                    return translations[w][ld];
                }
            }
            if(w && typeof w === 'object' && l && typeof l === 'string'){
                if(l in w){
                    return w[l];
                }else if(ld && typeof ld === 'string' && ld in w){
                    return w[ld];
                }
            }
            return w;
        }catch (e) {
            return w;
        }
    };
}

