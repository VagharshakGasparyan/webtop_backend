const {conf} = require("../config/app_config");
const {getWebAuth} = require("../components/functions");
const moment = require("moment/moment");
const {translations} = require("../components/translations");

async function auth(req, res, next) {
    res.locals.$auth = await getWebAuth(req, res);
    //----------old values-----------------------------------
    res.locals.$old = req.session.old || {};
    req.session.old = req.body || {};
    //----------previous url---------------------------------
    res.locals.$prevUrl = req.session.prevUrl || '';
    req.session.prevUrl = req.url || '';
    //----------errors---------------------------------------
    res.locals.$errors = req.session.errors || {};
    req.session.errors = {};

    res.locals.$fullUrl = {
        protocol: req.protocol,
        host: req.get('host'),
        path: req.path,
        query: req.query,
        url: req.url,
    };
    //----------local-----------------------------------------
    let ld = conf.lang.default ?? null;
    let l = res.locals.$local = conf.lang.default ?? null;
    res.locals.$tr = (w) => {
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
                }else{
                    return "";
                }
            }
            return w;
        }catch (e) {
            return w;
        }
    };
    //----------redirectBack----------------------------------
    let backURL = req.header('Referer') || req.url || '/';
    res.redirectBack = () => {
        return res.redirect(backURL);
    };
    next();
}
module.exports = auth;
