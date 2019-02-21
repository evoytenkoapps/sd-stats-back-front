'use strict'

const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');
const router = express.Router();
const groupby = require('../../helper/groupby');

router.route('/')
    .get(checkId);




async function checkId(req, res, next) {
    switch (req.query.id) {
        case 'growposition':
            getGrowPosition(req, res, next);
            break;
        case 'taskcontent':
            getTaskContent(req, res, next);
            break;
        case 'hardWareData':
            getHardwareData(req, res, next);
            break;

    }
}

async function getGrowPosition(req, res, next) {
    const product = req.query.product;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let body;
    try {
        const result = []
        const data = [] = await db_helper.getGrowPosition(product, startDate, endDate);
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


async function getTaskContent(req, res, next) {
    const product = req.query.product;
    const mode = req.query.mode;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const subcategory = req.query.subcategory;
    const position = req.query.position;
    const hardware = req.query.hardware;

    let body;
    try {
        const result = [];
        const data = [] = await db_helper.getTaskContent(product, mode, startDate, endDate, subcategory, position, hardware);
        body = requester.createBody(true, data, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


async function getHardwareData(req, res, next) {
    const period = req.query.period;
    const mode = req.query.mode;
    const day = req.query.day;
    const callscount = req.query.callscount;
    const subcategory = req.query.subcategory;
    const position = req.query.position;

    let body;
    try {
        let data = [] = await db_helper.getHardwareData(period, mode, day, callscount, subcategory, position);
        data = groupby.parse(data, 'hardware');
        const models = [];
        // Формируем уникальный массив моделей
        data.forEach(el => {
            for (const property in el) {
                if (property !== 'date') {
                    models.find(model => model === property) ? null : models.push(property);
                }
            }
        });
        models.sort();
        body = requester.createBody(true, { data, models }, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;