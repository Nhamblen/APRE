/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

"use strict";

const express = require("express");
const { mongo } = require("../../../utils/mongo");

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/regions", (req, res, next) => {
  try {
    mongo(async (db) => {
      const regions = await db.collection("sales").distinct("region");
      res.send(regions);
    }, next);
  } catch (err) {
    console.error("Error getting regions: ", err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/regions/:region", (req, res, next) => {
  try {
    mongo(async (db) => {
      const salesReportByRegion = await db
        .collection("sales")
        .aggregate([
          { $match: { region: req.params.region } },
          {
            $group: {
              _id: "$salesperson",
              totalSales: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 0,
              salesperson: "$_id",
              totalSales: 1,
            },
          },
          {
            $sort: { salesperson: 1 },
          },
        ])
        .toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error("Error getting sales data for region: ", err);
    next(err);
  }
});

/**
 * GET /api/reports/sales/sales-by-year
 * Returns aggregated yearly sales data
 */
router.get("/sales-by-year", (req, res, next) => {
  try {
    const startYear = req.query.startYear
      ? parseInt(req.query.startYear, 10)
      : null;
    const endYear = req.query.endYear ? parseInt(req.query.endYear, 10) : null;

    mongo(async (db) => {
      const pipeline = [
        {
          $project: {
            amount: 1,
            saleDate: { $toDate: "$saleDate" },
          },
        },
        {
          $addFields: {
            year: { $year: "$saleDate" },
          },
        },
        ...(startYear && endYear
          ? [
              {
                $match: {
                  year: { $gte: startYear, $lte: endYear },
                },
              },
            ]
          : []),
        {
          $group: {
            _id: "$year",
            totalSales: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            year: "$_id",
            totalSales: 1,
            count: 1,
            _id: 0,
          },
        },
        { $sort: { year: 1 } },
      ];

      const results = await db
        .collection("sales")
        .aggregate(pipeline)
        .toArray();
      res.status(200).send(results);
    }, next);
  } catch (err) {
    console.error("Error in /sales-by-year", err);
    next(err);
  }
});

module.exports = router;
