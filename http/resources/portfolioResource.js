const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
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
        let translatable = ["title", "client_description", "first_info_description", "first_info_title",
            "second_info_description", "second_info_title"];
        let categories = [];
        try {
            // let pc = await DB('portfolio_category').where('portfolio_id', r.id).get(['category_id']);
            // categories = await DB('categories').whereIn('id', pc.map((p) => {return p['category_id']})).get(['name', 'id']);
            categories = await DB('categories')
                .whereHas('portfolio_category', 'id', 'category_id', function (query) {
                    query.where('portfolio_id', r.id);
            }).get(['name', 'id']);
            // console.log(categories);
        }catch (e){
            console.error(e);
        }

        let resObj = {
            "id": r.id,
            "title": r.title ? JSON.parse(r.title) : {},
            "client": {
                "avatar": r.client_avatar,
                "name": r.client_name,
                "description": r.client_description ? JSON.parse(r.client_description) : {},
                "social": r.client_social ? JSON.parse(r.client_social) : {}
            },
            "first_info": {
                "description": r.first_info_description ? JSON.parse(r.first_info_description) : {},
                "title": r.first_info_title ? JSON.parse(r.first_info_title) : {},
            },
            "second_info": {
                "description": r.second_info_description ? JSON.parse(r.second_info_description) : {},
                "title": r.second_info_title ? JSON.parse(r.second_info_title) : {},
            },
            "image": r.image ?? null,
            "gallery": r.gallery ? JSON.parse(r.gallery) : [],
            "background": r.background ?? null,
            "active": r.active,
            "categories": categories,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
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