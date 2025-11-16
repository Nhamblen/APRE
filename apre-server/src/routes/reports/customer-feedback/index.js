/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre customer feedback API for the customer feedback reports
 */

"use strict";

const express = require("express");
const { mongo } = require("../../../utils/mongo");
const createError = require("http-errors");

const router = express.Router();

/**
 * @description
 *
 * GET /channel-rating-by-month
 *
 * Fetches average customer feedback ratings by channel for a specified month.
 *
 * Example:
 * fetch('/channel-rating-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/channel-rating-by-month", (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, "month and channel are required"));
    }

    mongo(async (db) => {
      const data = await db
        .collection("customerFeedback")
        .aggregate([
          {
            $addFields: {
              date: { $toDate: "$date" },
            },
          },
          {
            $group: {
              _id: {
                channel: "$channel",
                month: { $month: "$date" },
              },
              ratingAvg: { $avg: "$rating" },
            },
          },
          {
            $match: {
              "_id.month": Number(month),
            },
          },
          {
            $group: {
              _id: "$_id.channel",
              ratingAvg: { $push: "$ratingAvg" },
            },
          },
          {
            $project: {
              _id: 0,
              channel: "$_id",
              ratingAvg: 1,
            },
          },
          {
            $group: {
              _id: null,
              channels: { $push: "$channel" },
              ratingAvg: { $push: "$ratingAvg" },
            },
          },
          {
            $project: {
              _id: 0,
              channels: 1,
              ratingAvg: 1,
            },
          },
        ])
        .toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error("Error in /rating-by-date-range-and-channel", err);
    next(err);
  }
});

/**
 * @description
 * GET /customer-feedback-by-region
 *
 * Returns customer feedback grouped by region, including:
 * - product
 * - rating
 * - feedbackType
 * - feedbackText
 * - region
 * - averageRating (calculated per region)
 */

router.get("/customer-feedback-by-region", (req, res, next) => {
  try {
    // Connect to MongoDB
    mongo(async (db) => {
      const data = await db
        .collection("customerFeedback")
        .aggregate([
          // Select only the fields we need from each document
          {
            $project: {
              region: 1,
              product: 1,
              rating: 1,
              feedbackType: 1,
              feedbackText: 1,
            },
          },

          // Group documents by region
          {
            $group: {
              _id: "$region",
              feedback: {
                // Push feedback information into an array
                $push: {
                  product: "$product",
                  rating: "$rating",
                  feedbackType: "$feedbackType",
                  feedbackText: "$feedbackText",
                },
              },
              averageRating: { $avg: "$rating" }, // Calculate average rating per region
            },
          },

          // Format the final output
          {
            $project: {
              _id: 0, // Remove internal MongoDB _id
              region: "$_id", // Rename _id to region
              feedback: 1, // Include feedback list
              averageRating: { $round: ["$averageRating", 2] }, // Round average rating to 2 decimals
            },
          },
        ])
        .toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error("Error in /customer-feedback-by-region", err);
    next(err);
  }
});

module.exports = router;
