"use strict";

const express = require("express");
const url = require("url");

const db_helper = require("../../db/db_helper");
const requester = require("../requester");

const router = express.Router();

router.route("/").get(getOffline);

async function getOffline(req, res, next) {
  const period = req.query.period;
  const day = req.query.day;
  const count = req.query.count;
  console.log("getOffline", period, day, count);
  let body;
  try {
    body = requester.createBody(true, [], null);
  } catch (error) {
    body = requester.getDbError(error);
  }
  res.json(body);
}

module.exports = router;
