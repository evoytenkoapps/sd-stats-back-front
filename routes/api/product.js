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
    const interval = req.query.interval;
    const mode = req.query.mode;
    const day = req.query.day;
    const callscount = req.query.callscount;
    let body;
    try {
        const result = { data: [], attr: [] };
        result.data = await db_helper.getProduct(product, interval, mode, day, callscount);
        // Делаем группировку по продукту
        result.data = groupby.parse(result.data, 'subcategory');
        // Формируем уникальный массив подкатегорий

        result.data.forEach(el => {
            for (const property in el) {
                if (property !== 'date') {
                    result.attr.find(model => model === property) ? null : result.attr.push(property);
                }
            }
        });
        result.attr.sort();

        body = requester.createBody(true, result, null);

    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
};

module.exports = router;
