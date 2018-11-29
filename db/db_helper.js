'use strict'
var {
    db,
    helpers
} = require('./db_connection');
const environment = require('../environment.js');
const modes = require('../model/modes');
const workingdays = require('../model/workingdays');
const callsday = require('../model/callsday');
const products = require('../model/products');
const periods = require('../model/periods');

class DbHelper {


    async getProduct(product, period, mode, day, cday) {

        if (!Object.values(products).find(el => el === product)) {
            throw Error('Wrong product :' + product);
        }

        if (!Object.values(periods).find(el => el === period)) {
            throw Error('Wrong period :' + period);
        }

        if (!Object.values(modes).find(el => el === mode)) {
            throw Error('Wrong mode :' + mode);
        };

        if (!Object.values(workingdays).find(el => el === day)) {
            throw Error('Wrong day :' + day);
        };

        if (!Object.values(callsday).find(el =>
            el === cday)) {
            throw Error('Wrong callsday :' + cday);
        };


        const workingFilter = day === workingdays.working ? `AND date_trunc('day', time_create)::timestamp::date NOT IN (SELECT date FROM ${environment.table_holidays})` : '';
        const callsdayFilter = cday === callsday.day ? `round(COUNT(id)::numeric / count(DISTINCT(date_trunc('day', time_create)::timestamp::date))::numeric,2) as count` : `COUNT(id)`;

        const query_data =
            `    
        SELECT date_trunc('${period}', time_create)::timestamp::date || '' AS date, subcategory,
        ${callsdayFilter} FROM ${environment.table_calls} WHERE mode = '${mode}' ${workingFilter}
        AND product = '${product}'
        GROUP BY date, subcategory 
        ORDER BY date; 
        `;

        const query_subcategory = `SELECT DISTINCT(subcategory) FROM ${environment.table_calls} WHERE product = '${product}';`

        const [res1, res2] = await Promise.all([
            this.request(query_data),
            this.request(query_subcategory),
        ]);

        return [res1, res2];
    }

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


    async getSubcategories(product) {
        const query = `SELECT DISTINCT(subcategory) FROM ${environment.table_calls} WHERE product = '${product}';`
        const result = await this.request(query);
        return result;
    }

    async getPosition(product, subcategory, period, mode, day, cday) {
        if (!Object.values(products).find(el => el === product)) {
            throw Error('Wrong product :' + product);
        }

        if (!Object.values(periods).find(el => el === period)) {
            throw Error('Wrong period :' + period);
        }

        if (!Object.values(modes).find(el => el === mode)) {
            throw Error('Wrong mode :' + mode);
        };

        if (!Object.values(workingdays).find(el => el === day)) {
            throw Error('Wrong day :' + day);
        };

        if (!Object.values(callsday).find(el =>
            el === cday)) {
            throw Error('Wrong callsday :' + cday);
        };


        const workingFilter = day === workingdays.working ? `AND date_trunc('day', time_create)::timestamp::date NOT IN (SELECT date FROM ${environment.table_holidays})` : '';
        const callsdayFilter = cday === callsday.day ? `round(COUNT(id)::numeric / count(DISTINCT(date_trunc('day', time_create)::timestamp::date))::numeric,2) as count` : `COUNT(id)`;

        const query_data =
            `    
        SELECT date_trunc('${period}', time_create)::timestamp::date || '' AS date, position,
        ${callsdayFilter} FROM ${environment.table_calls} WHERE mode = '${mode}' ${workingFilter}
        AND product = '${product}'
        AND subcategory = '${subcategory}'
        GROUP BY date, position 
        ORDER BY date;`;

        const query_positions = `SELECT distinct(position) from ${environment.table_calls} where product = '${product}' AND subcategory = '${subcategory}'`;

        const [res1, res2] = await Promise.all([
            this.request(query_data),
            this.request(query_positions)
        ]);

        return [res1, res2];

    }


    async getGrowPosition(startDate, endDate) {
        const query =
            `
WITH val AS (
    SELECT  '${startDate}'::DATE startDate, '${endDate}'::DATE endDate
    )
    SELECT position1, total1, count1::numeric, total2::numeric, count2::numeric, round((count2::numeric/count1::numeric)-1,2) FROM ( SELECT position position1, count(*) total1, round( count(*)::numeric/count(DISTINCT(time_create::DATE))::numeric,2 )::numeric as count1
      FROM ${environment.table_calls} CROSS JOIN val
           LEFT JOIN ${environment.table_holidays} h ON h.date = DATE_TRUNC('DAY', time_create)  
     WHERE time_create >= DATE_TRUNC('WEEK', startDate)
       AND time_create  < DATE_TRUNC('WEEK', startDate) + INTERVAL '1 WEEK'
       AND h.date IS NULL
       GROUP BY position ) t_start 
       INNER JOIN
       ( SELECT position position2, count(*) total2, round( count(*)::numeric/count(DISTINCT(time_create::DATE))::numeric,2 ) as count2
      FROM ${environment.table_calls} CROSS JOIN val
           LEFT JOIN ${environment.table_holidays} h ON h.date = DATE_TRUNC('DAY', time_create)  
     WHERE time_create >= DATE_TRUNC('WEEK', endDate)
       AND time_create  < DATE_TRUNC('WEEK', endDate) + INTERVAL '1 WEEK'
       AND h.date IS NULL
       GROUP BY position ) t_end ON t_start.position1=t_end.position2  ORDER BY round DESC;
`
        return await this.request(query);
    }


    async request(query, data) {
        console.log(query);
        return await db.any(query, data);
    }
};

module.exports = new DbHelper();