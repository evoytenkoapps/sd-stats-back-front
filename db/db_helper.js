var {
    db,
    helpers
} = require('./db_connection');
let environment = require('../environment.js');

class DbHelper {

    async getProducts(period) {
        let query;
        switch (period) {
            case 'week':
                query = `SELECT date_trunc('week', time_create::date) AS date, product, 
            COUNT(id)           
     FROM ${environment.table_calls}
     GROUP BY date, product
     ORDER BY date;`
                break;
        }

        const result = await this.request(query);
        return result;
    }

    async request(query, data) {
        console.log(query);
        return await db.any(query, data);
        // try {
        //     console.log(query);
        //     return await db.any(query, data);
        // } catch (error) {
        //     console.error('Ошибка в запросе:', query, error);
        //     return error;
        // }

    }
};

module.exports = new DbHelper();