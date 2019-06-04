"use strict";

const express = require("express");
const db_helper = require("../../db/db_helper");
const requester = require("../requester");
const groupBy = require("../../helper/groupby");
const uniqFields = require("../../helper/uniquefields");

const router = express.Router();

router.route("/").get(getOffline);

async function getOffline(req, res, next) {
  const period = req.query.period;
  const day = req.query.day;
  const count = req.query.count;
  console.log("getOffline", period, day, count);
  let body;
  try {
    const data = await db_helper.getOffineOnline(period, day, count);
    const attributes = uniqFields.parseFields(data);
    const result = groupBy.parse(data, "type");
    body = requester.createBody(true, { data: result, attr: attributes }, null);
  } catch (error) {
    body = requester.getDbError(error);
  }
  res.json(body);
}

module.exports = router;
