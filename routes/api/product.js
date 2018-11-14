const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');

const router = express.Router();

router.route('/')
    .get(getProduct);


async function getProduct(req, res, next) {
    const period = req.query.period;
    let body;
    try {
        const data = await db_helper.getProducts(period);
        body = requester.createBody(true, data, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;