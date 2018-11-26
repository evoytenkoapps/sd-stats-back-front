'use strict'

const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');
const groupby = require('../../helper/groupby');

const router = express.Router();

router.route('/')
    .get(getProduct);


async function getProduct(req, res, next) {
    const product = req.query.product;
    const period = req.query.period;
    const mode = req.query.mode;
    const day = req.query.day;
    const callscount = req.query.callscount;
    let body;
    try {
        const result = { data: [], attr: [] };
        const data = [] = await db_helper.getProduct(product, period, mode, day, callscount);
        result.attr = data[1];
        // Делаем группировку по продукту
        var groupBy = function (arr, key) {
            return arr.reduce(function (groups, item) {
                const val = item[key];
                groups[val] = groups[val] || [];
                groups[val].push(item);
                return groups;
            }, {});
        };

        const buff = groupBy(data[0], 'date');
        for (const key in buff) {
            const obj = {};
            buff[key].forEach(element => {
                obj[element.subcategory] = element.count;
            });
            obj.date = key;
            result.data.push(obj);
        }
        body = requester.createBody(true, result, null);

    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;