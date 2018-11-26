var {
    db,
    helpers
} = require('./db_connection');
const environment = require('../environment.js');
const modes = require('../model/modes');
const workingdays = require('../model/workingdays');
const callsday = require('../model/callsday');


class DbHelper {

    async getProducts(period, mode, day, cday) {
        const periods = ['day', 'week', 'month', 'year'];

        if (!periods.find(el => period === el)) {
            throw Error('Wrong period :' + period);
        }

        if (!Object.values(modes).find(el => el === mode)) {
            throw Error('Wrong mode :' + mode);
        }

        if (!Object.values(workingdays).find(el => el === day)) {
            throw Error('Wrong day :' + day);
        }

        if (!Object.values(callsday).find(el => 
            el === cday)) {
            throw Error('Wrong callsday :' + cday);
        }


        const workingFilter = day === workingdays.working ? `AND date_trunc('day', time_create)::timestamp::date NOT IN (SELECT date FROM ${environment.table_holidays})` : '';
        const callsdayFilter = cday === callsday.day ? `round(COUNT(id)::numeric / count(DISTINCT(date_trunc('day', time_create)::timestamp::date))::numeric,2) as count` : `COUNT(id)`;

        const query =
            `    
        SELECT date_trunc('${period}', time_create)::timestamp::date || '' AS date, product,
        ${callsdayFilter} FROM ${environment.table_calls} WHERE mode = '${mode}' ${workingFilter}
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