var {
    db,
    helpers
} = require('./db_connection');
let environment = require('../environment.js');

class DbHelper {

    async getProducts(period) {
        const periods = ['day', 'week', 'month', 'year'];
        if (!periods.find(el => period === el)) {
            throw Error('Wrong period :' + period);
        }

        const query =
            `
        SELECT date_trunc('${period}', time_create)::timestamp::date || '' AS date, product,
        COUNT(id) FROM ${environment.table_calls} WHERE product is not null 
        GROUP BY date, product 
        ORDER BY date;
 `
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