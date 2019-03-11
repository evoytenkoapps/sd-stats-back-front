'use strict'

const express = require('express');
const url = require('url');
const parse = require('url-parse')
const db_helper = require('../../db/db_helper');
const requester = require('../requester');
const router = express.Router();

router.route('/')
    .get(checkId);




async function checkId(req, res, next) {
    switch (req.query.id) {
        case 'subcategory':
            getSubcat(req, res, next);
            break;
        case 'position':
            getPos(req, res, next);
            break;
        case 'hardware':
            getHard(req, res, next);
            break;
    }
}

async function getSubcat(req, res, next) {
    const products = req.query.product;
    let body;
    try {
        const result = []
        const data = [] = await db_helper.getSubcategories(products);
        data.forEach(element => {
            result.push(element.subcategory)
        });
        // Делаем группировку по продукту
        body = requester.createBody(true, result, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


async function getPos(req, res, next) {
    let body;
    const products = req.query.product;
    const subcategory = req.query.subcategory;
    try {
        const result = [];
        const data = [] = await db_helper.getAttrPos(products, subcategory);
        data.forEach(element => {
            result.push(element.position);
        });
        body = requester.createBody(true, result, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}

async function getHard(req, res, next) {
    let body;
    const product = req.query.product;
    const subcategory = req.query.subcategory;
    const position = req.query.position;
    try {
        const result = [];
        const data = [] = await db_helper.getAttrHard(product, subcategory, position);
        data.forEach(element => {
            result.push(element.hardware);
        });
        body = requester.createBody(true, result, null);
    }
    catch (error) {
        body = requester.getDbError(error);
    }
    res.json(body);
}


module.exports = router;