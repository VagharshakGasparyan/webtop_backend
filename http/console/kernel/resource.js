class Resource/*resource-separator*/ {
    constructor(resource = {}, params = {}) {
        this.resource = resource;
        this.params = params;
        return this.index(resource);
    }

    async index(r) {

        return {
            "id": r.id,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        };
    }
}

