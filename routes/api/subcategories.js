'use strict'

const express = require('express');
const url = require('url');

const db_helper = require('../../db/db_helper');
const requester = require('../requester');
const router = express.Router();

router.route('/')
    .get(getSubcategories);




async function getSubcategories(req, res, next) {
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


module.exports = router;