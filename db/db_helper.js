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

    constructor() {
        this.filters = {
            filter_product: function (product) {
                return product === products.ALL ? null : ` product = '${product}'`;
            },
            filter_subcategory: function (subcategory) {
                return subcategory ? ` subcategory='${subcategory}'` : '';
            }
        }
    }

    async getAttrSubcat(product) {
        const query = `SELECT DISTINCT(subcategory) FROM ${environment.table_calls} ${this.filters.filter_product(product) ? 'WHERE ' + this.filters.filter_product(product) : ''}  ORDER BY subcategory`;
        return await this.request(query);
    }

    async getAttrPos(products, subcategory) {
        const filterProducts = products === 'ALL' ? '' : this.getFilterProducts(products);
        const filterSubcategory = products === 'ALL' ? ` subcategory='${subcategory}'` : `AND subcategory='${subcategory}'`;
        const query = `SELECT DISTINCT(position) FROM ${environment.table_calls} WHERE  ${filterProducts} ${filterSubcategory}  ORDER BY position`;
        return await this.request(query);
    }

    async getAttrHard() {
        const query = `SELECT DISTINCT(hardware) FROM ${environment.table_calls} ORDER BY hardware`;
        return await this.request(query);
    }

    async getProduct(product, period, mode, day, callsInDay) {

        console.log('getProducts');
        const filter_mode = mode ? ` MODE = '${mode}'` : ``;
        const filter_working_day1 = day === workingdays.working ? `   WHERE date NOT IN (SELECT date FROM holidays)` : '';
        const filter_working_day2 = day === workingdays.working ? ` AND date_trunc('day', time_create)::date NOT IN (SELECT date FROM holidays)` : '';
        const filter_not_now = ` AND time_create::date < now()::date`;
        const show_calls_in_day = callsInDay === callsday.day ? `round(COUNT::numeric / peroid_days::numeric, 2)` : `count`;
        const query_data =
            `
       WITH period AS
       (SELECT period,
               COUNT (distinct(date)) AS peroid_days
        FROM
          (SELECT date_trunc('${period}', date)::date AS period , date
           FROM
             (SELECT (generate_series('${environment.sql_periods_start_date}', current_date - 1, '1 day'::interval))::date date) t
            ${filter_working_day1}) t1
        GROUP BY period),
          tasks AS
       ( (SELECT date_trunc('${period}', time_create)::date AS date,
       subcategory,
                        COUNT(id)
                 FROM sd
                 WHERE ${filter_mode}  AND product='${product}'  ${filter_working_day2} ${filter_not_now}
                 GROUP BY date, subcategory
                 ORDER BY date)
              UNION ALL
                (SELECT date_trunc('${period}', time_create)::date AS date,
                        'ALL',
                        COUNT(id)
                 FROM sd
                 WHERE ${filter_mode}  AND product='${product}'  ${filter_working_day2} ${filter_not_now}
                 GROUP BY date
                 ORDER BY date) 
       ),
          j_tasks AS
       (SELECT CASE
                   WHEN date IS NULL THEN period
                   ELSE date
               END AS date,
               subcategory,
               CASE
                   WHEN COUNT IS NULL THEN 0
                   ELSE ${show_calls_in_day}
               END AS COUNT
        FROM (
                (SELECT *
                 FROM tasks) t_t
              RIGHT JOIN
                (SELECT *
                 FROM period) t_p ON t_t.date = t_p.period)),
          j_subcategorys AS
       (SELECT *
        FROM (
                (SELECT DISTINCT subcategory AS j_subcategorys_subcategory
                 FROM tasks) t_prod
              CROSS JOIN
                (SELECT period AS j_subcategorys_period
                 FROM period) t_p)),
          j_tasks_null AS
       (SELECT date, CASE
                         WHEN subcategory IS NULL THEN j_subcategorys_subcategory
                     END AS subcategory,
                     COUNT
        FROM
          (SELECT *
           FROM j_tasks
           WHERE subcategory IS NULL ) t_n
        LEFT JOIN
          (SELECT *
           FROM j_subcategorys) t_h ON t_n.date= t_h.j_subcategorys_period)
     SELECT date || '' AS date,
                    subcategory,
                    COUNT
     FROM
       (SELECT *
        FROM j_tasks
        UNION ALL SELECT *
        FROM j_tasks_null
        ORDER BY date) t_res
     ORDER BY DATE;
       `;

        return this.request(query_data);
    }

    async getProducts(period, mode, day, callsInDay) {
        console.log('getProducts');
        const filter_mode = mode ? ` MODE = '${mode}'` : ``;
        const filter_working_day1 = day === workingdays.working ? `   WHERE date NOT IN (SELECT date FROM holidays)` : '';
        const filter_working_day2 = day === workingdays.working ? ` AND date_trunc('day', time_create)::date NOT IN (SELECT date FROM holidays)` : '';
        const filter_not_now = ` AND time_create::date < now()::date`;
        const show_calls_in_day = callsInDay === callsday.day ? `round(COUNT::numeric / peroid_days::numeric, 2)` : `count`;
        const query =
            `
        WITH period AS
        (SELECT period,
                COUNT (distinct(date)) AS peroid_days
         FROM
           (SELECT date_trunc('${period}', date)::date AS period , date
            FROM
              (SELECT (generate_series('${environment.sql_periods_start_date}', current_date - 1, '1 day'::interval))::date date) t
             ${filter_working_day1}) t1
         GROUP BY period),
           tasks AS
        ( (SELECT date_trunc('${period}', time_create)::date AS date,
                         product,
                         COUNT(id)
                  FROM sd
                  WHERE ${filter_mode} ${filter_working_day2} ${filter_not_now}
                  GROUP BY date, product
                  ORDER BY date)
               UNION ALL
                 (SELECT date_trunc('${period}', time_create)::date AS date,
                         'ALL',
                         COUNT(id)
                  FROM sd
                  WHERE ${filter_mode} ${filter_working_day2} ${filter_not_now}
                  GROUP BY date
                  ORDER BY date) 
        ),
           j_tasks AS
        (SELECT CASE
                    WHEN date IS NULL THEN period
                    ELSE date
                END AS date,
                product,
                CASE
                    WHEN COUNT IS NULL THEN 0
                    ELSE ${show_calls_in_day}
                END AS COUNT
         FROM (
                 (SELECT *
                  FROM tasks) t_t
               RIGHT JOIN
                 (SELECT *
                  FROM period) t_p ON t_t.date = t_p.period)),
           j_products AS
        (SELECT *
         FROM (
                 (SELECT DISTINCT product AS j_products_product
                  FROM tasks) t_prod
               CROSS JOIN
                 (SELECT period AS j_products_period
                  FROM period) t_p)),
           j_tasks_null AS
        (SELECT date, CASE
                          WHEN product IS NULL THEN j_products_product
                      END AS product,
                      COUNT
         FROM
           (SELECT *
            FROM j_tasks
            WHERE product IS NULL ) t_n
         LEFT JOIN
           (SELECT *
            FROM j_products) t_h ON t_n.date= t_h.j_products_period)
      SELECT date || '' AS date,
                     product,
                     COUNT
      FROM
        (SELECT *
         FROM j_tasks
         UNION ALL SELECT *
         FROM j_tasks_null
         ORDER BY date) t_res
      ORDER BY DATE
        `;

        const result = await this.request(query);
        return result;

    }

    getFilterProducts(products) {
        let filterProducts = '';
        products.forEach((pr, index) => {
            index === 0 ? filterProducts = ` ( product = '${pr}'` : filterProducts += ` OR product = '${pr}'`;
            index === products.length - 1 ? filterProducts += ') ' : null;
        });
        return filterProducts;
    }

    async getSubcategories(products) {
        const filterProducts = this.getFilterProducts(products);
        const query = `SELECT DISTINCT(subcategory) FROM ${environment.table_calls} WHERE ${filterProducts} ORDER BY subcategory;`
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


    async getGrowPosition(product, startDate, endDate) {

        if (!Object.values(products).find(el => el === product)) {
            throw Error('Wrong product :' + product);
        };

        const filter_product = product === products.ALL ? '' : `AND product = '${product}'`;

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
       ${filter_product} 
       GROUP BY position ) t_start 
       INNER JOIN
       ( SELECT position position2, count(*) total2, round( count(*)::numeric/count(DISTINCT(time_create::DATE))::numeric,2 ) as count2
      FROM ${environment.table_calls} CROSS JOIN val
           LEFT JOIN ${environment.table_holidays} h ON h.date = DATE_TRUNC('DAY', time_create)  
     WHERE time_create >= DATE_TRUNC('WEEK', endDate)
       AND time_create  < DATE_TRUNC('WEEK', endDate) + INTERVAL '1 WEEK'
       AND h.date IS NULL 
       ${filter_product} 
       GROUP BY position ) t_end ON t_start.position1=t_end.position2  ORDER BY round DESC;
`
        return await this.request(query);
    }

    async getTaskContent(product, mode, startDate, endDate, subcategory, position, hardware) {
        const filter_hardware = hardware === undefined ? '' : ` AND hardware = '${hardware}'`;
        const filter_position = position === undefined ? '' : ` AND position = '${position}'`;
        const filter_subcat = subcategory === undefined ? '' : ` AND subcategory = '${subcategory}'`;
        const filter_product = product === products.ALL ? '' : ` AND product = '${product}'`;
        const query = `SELECT task_id, title,description,decision, subcategory, position, hardware, result FROM ${environment.table_calls} WHERE time_create::date>='${startDate}' AND time_create::date<='${endDate}' AND mode='${mode}' ${filter_product} ${filter_subcat} ${filter_position} ${filter_hardware}`;
        return await this.request(query);
    }


    /**
     *
     *
     * @param {*} mode
     * @param {*} day
     * @param {*} cday
     * @param {*} subcategory
     * @param {*} position
     * @returns
     * @memberof DbHelper
     */
    async getHardwareData(period, mode, day, callsInDay, subcategory, position) {
        const filter_mode = mode ? ` MODE = '${mode}'` : ``;
        const filter_position = position === undefined ? '' : ` AND position = '${position}'`;
        const filter_subcat = subcategory === undefined ? '' : ` AND subcategory = '${subcategory}'`;
        const filter_product = ` AND ( product = 'SIP' OR product = 'MTALKER' )`;
        const filter_working_day1 = day === workingdays.working ? `   WHERE t.date NOT IN (SELECT date FROM holidays)` : '';
        const filter_working_day2 = day === workingdays.working ? ` AND date_trunc('day', time_create)::date NOT IN (SELECT date FROM ${environment.table_holidays})` : '';
        const show_calls_in_day = callsInDay === callsday.day ? `round(COUNT::numeric / peroid_days::numeric, 2)` : `count`;
        const show_subcategory = subcategory ? ', subcategory' : '';
        const show_position = position ? ', position' : '';
        const show_subcategory_is_null = subcategory ? ` , CASE WHEN subcategory is NULL THEN '${subcategory}' ELSE subcategory END as subcategory` : '';
        const show_position_is_null = position ? ` , CASE WHEN position is NULL THEN '${position}' ELSE position END as position ` : '';
        const hardwares = [['ALL', '%%'], ['Yealink_all', '%Yeal%'], ['Panasonic_all', '%Panas%'], ['Grandstream_all', '%Grand%'], ['Gigaset_all', '%Giga%'], ['10. M.TALKER_all', '%M.TALKER%']];
        let query_hardwares = ``;

        hardwares.forEach(el => {
            const filter_hardware = ` AND hardware like '${el[1]}'`;
            query_hardwares += `
        UNION ALL 

        ( SELECT date_trunc('${period}', time_create)::date AS date ${show_subcategory} ${show_position} , '${el[0]}' as hardware, count(id)
        FROM ${environment.table_calls}
        WHERE ${filter_mode} ${filter_working_day2} ${filter_product} ${filter_position} ${filter_subcat} ${filter_hardware}
        GROUP BY date  ${show_subcategory} ${show_position}
        ORDER BY date )
        `;
        });

        const query =
            `
WITH period AS
    ( SELECT period,
             COUNT (distinct(date)) AS peroid_days
      FROM
       (SELECT date_trunc('${period}', date)::date AS period , date
       FROM
         ( SELECT (generate_series('${environment.sql_periods_start_date}', now(), '1 day'::interval))::date date) t
      ${filter_working_day1} ) t1
     GROUP BY period), 
tasks as ( ( SELECT date_trunc('${period}', time_create)::date AS date ${show_subcategory} ${show_position} , hardware, count(id)
FROM sd
WHERE MODE = '${mode}' ${filter_working_day2} ${filter_product} ${filter_position} ${filter_subcat}
GROUP BY date  ${show_subcategory} ${show_position} , hardware
ORDER BY date )
${query_hardwares}), 

-- Конкат заявок и периодов
        
j_tasks AS
(
SELECT CASE WHEN date is NULL THEN period ELSE date END as date ${show_subcategory_is_null} ${show_position_is_null} , hardware, CASE WHEN count is NULL THEN 0 ELSE ${show_calls_in_day} END as count 
FROM (
      ( SELECT * FROM tasks) t_t
    RIGHT JOIN
      ( SELECT *
       FROM period ) t_p ON t_t.date = t_p.period )
       ),
-- Конкат оборудования и периодов чтобы определеить оборудования по которым нет заявок

       j_harwdwares AS ( SELECT * FROM (( SELECT DISTINCT hardware as j_harwdwares_hardware FROM tasks ) t_h
    CROSS JOIN
      ( SELECT period as j_harwdwares_period
       FROM period ) t_p ) ),

         -- Конкат оборудования и заявок чтобы выставить подкатегорию и позицию по которым нет заявок
                       
       j_tasks_null AS ( SELECT date ${show_subcategory} ${show_position}, CASE WHEN hardware is NULL THEN j_harwdwares_hardware END as hardware,count   FROM ( SELECT * FROM j_tasks WHERE hardware is NULL ) t_n LEFT JOIN ( SELECT * FROM j_harwdwares )  t_h ON   t_n.date= t_h.j_harwdwares_period )

       SELECT date || '' as date, hardware,count FROM  ( SELECT * FROM j_tasks  UNION ALL SELECT * FROM  j_tasks_null ORDER BY date ) t_res
`;
        return await this.request(query);
    }


    async request(query, data) {
        console.log(query);
        return await db.any(query, data);
    }



};

module.exports = new DbHelper();