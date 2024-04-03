const {DB} = require("../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const ClientCategoriesResource = require("./clientCategoriesResource");
class ClientPortfolioResource {
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
        let categories = [];
        try {
            categories = await DB('categories')
                .whereHas('portfolio_category', 'id', 'category_id', function (query) {
                    query.where('portfolio_id', r.id);
            }).get();
            categories = await new ClientCategoriesResource(categories, 'hy');
        }catch (e){
            console.error(e);
        }

        return {
            "id": r.id,
            "title": r.title ? JSON.parse(r.title) : {},
            "client": {
                "avatar": r.client_avatar,
                "name": r.client_name ? JSON.parse(r.client_name) : {},
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
            "categories": categories,
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

module.exports = ClientPortfolioResource;