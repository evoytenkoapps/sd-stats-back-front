'use strict'

const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');

const router = express.Router();

router.route('/')
    .get(getProduct);


async function getProduct(req, res, next) {
    const period = req.query.period;
    const mode = req.query.mode;
    const day = req.query.day;
    let body;
    try {
        const result = [];
        const data = [] = await db_helper.getProducts(period, mode, day);

        // Делаем группировку по продукту
        var groupBy = function (arr, key) {
            return arr.reduce(function (groups, item) {
                const val = item[key];
                groups[val] = groups[val] || [];
                groups[val].push(item);
                return groups;
            }, {});
        };

        const buff = groupBy(data, 'date');
        for (const key in buff) {
            const obj = {};
            buff[key].forEach(element => {
                obj[element.product] = element.count;
            });
            obj.date = key;
            result.push(obj);
        }
        body = requester.createBody(true, result, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;