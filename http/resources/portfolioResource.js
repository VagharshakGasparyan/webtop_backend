const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const ClientCategoriesResource = require("./clientCategoriesResource");
class PortfolioResource {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        this.local = params;
        if(Array.isArray(resource)){
            return this.collection(resource);
        }
        return this.index(resource);
    }

    async index(r) {
        let translatable = ["title", "client_name", "client_description", "first_info_description", "first_info_title",
            "second_info_description", "second_info_title"];
        let categories = [];
        try {
            // let pc = await DB('portfolio_category').where('portfolio_id', r.id).get(['category_id']);
            // categories = await DB('categories').whereIn('id', pc.map((p) => {return p['category_id']})).get(['name', 'id']);
            categories = await DB('categories')
                .whereHas('portfolio_category', 'id', 'category_id', function (query) {
                    query.where('portfolio_id', r.id);
            }).get();
            categories = await new ClientCategoriesResource(categories, 'hy');
            // console.log(categories);
        }catch (e){
            console.error(e);
        }

        let resObj = {
            "id": r.id,
            "client_avatar": r.client_avatar,
            "image": r.image ?? null,
            "gallery": r.gallery ? JSON.parse(r.gallery) : [],
            "background": r.background ?? null,
            "active": r.active,
            "categories": categories,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
        let clientSocial = r.client_social ? JSON.parse(r.client_social) : {};
        for(let clSh in clientSocial){
            resObj['client_social_' + clSh] = clientSocial[clSh];
        }

        translatable.forEach((trField)=>{
            let items = r[trField] ? JSON.parse(r[trField]) : {};
            // resObj[trField] = items;
            for(let langKey in items){
                resObj[trField + '_' + langKey] = items[langKey];
            }
        });
        return resObj;
    }

    async collection(resource) {
        let aArr = [];
        for(let r of resource){
            aArr.push(await this.index(r));
        }
        return aArr;
    }
}

module.exports = PortfolioResource;