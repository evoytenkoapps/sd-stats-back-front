var {
    db,
    helpers
} = require('./db_connection');
const environment = require('../environment.js');
const modes = require('../model/modes');

class DbHelper {

    async getProducts(period, mode) {
        const periods = ['day', 'week', 'month', 'year'];

        if (!periods.find(el => period === el)) {
            throw Error('Wrong period :' + period);
        }

        if (!Object.values(modes).find(el => 
            el === mode
            )) {
            throw Error('Wrong mode :' + mode);
        }

        const query =
            `    
        SELECT date_trunc('${period}', time_create)::timestamp::date || '' AS date, product,
        COUNT(id) FROM ${environment.table_calls} WHERE mode = '${mode}'
        GROUP BY date, product 
        ORDER BY date; 
        `
        const result = await this.request(query);
        return result;
    }

    async request(query, data) {
        console.log(query);
        return await db.any(query, data);
    }
};

module.exports = new DbHelper();