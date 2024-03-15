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
        let trans = {};
        translatable.forEach((t)=>{
            trans[t] = r.t ? tr(JSON.parse(r.t), this.local) : r.t;
        });
        let categories = [];
        try {
            // let answer = await DB('sessions')
            //     .where('role', 'admin')
            //     .whereHas('users', 'user_id', 'id', function (query) {
            //         query.where('role', 'admin');
            //         query.orWhere('role', 'user');
            //     }).get();
            // console.log(answer);
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

        return {
            "id": r.id,
            "title": trans.title,
            "client_avatar": r.client_avatar,
            "client": {
                "name": r.client_name,
                "description": trans.client_description,
                "social": r.client_social ? JSON.parse(r.client_social) : r.client_social
            },
            "first_info": {
                "description": trans.first_info_description,
                "title": trans.first_info_title
            },
            "second_info": {
                "description": trans.second_info_description,
                "title": trans.second_info_title
            },
            "image": r.image,
            "gallery": r.gallery ? JSON.parse(r.gallery) : r.gallery,
            "background": r.background,
            "categories": categories,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
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