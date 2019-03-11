'use strict'

const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');

const router = express.Router();
const groupby = require('../../helper/groupby');
const uniqFields = require('../../helper/uniquefields');

router.route('/')
    .get(getPositions);




async function getPositions(req, res, next) {
    const product = req.query.product;
    const subcategory = req.query.subcategory;
    const period = req.query.period;
    const mode = req.query.mode;
    const day = req.query.day;
    const callscount = req.query.callscount;
    let body;
    try {
        let result = {};
        const data = await db_helper.getPosition(product, subcategory, period, mode, day, callscount);
        // Делаем группировку по продукту
        result.data = groupby.parse(data, 'position');
        result.attr = uniqFields.parseFields(data);
        body = requester.createBody(true, result, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;