'use strict'

const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');
const router = express.Router();

router.route('/')
    .get(checkId);




async function checkId(req, res, next) {
    switch (req.query.id) {
        case 'growposition':
            getGrowPosition(req, res, next);
            break;
    }
}

async function getGrowPosition(req, res, next) {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let body;
    try {
        const result = []
        const data = [] = await db_helper.getGrowPosition(startDate, endDate);
        data.forEach(element => {
            element.total1 = parseInt(element.total1);
            element.count1 = parseFloat(element.count1);
            element.total2 = parseInt(element.total2);
            element.count2 = parseFloat(element.count2);
            element.round = parseFloat(element.round);
            result.push(element);
        });
        body = requester.createBody(true, data, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;