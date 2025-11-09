/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports.
 */

"use strict";

const express = require("express");
const { mongo } = require("../../../utils/mongo");
const createError = require("http-errors");
const { ObjectId } = require("mongodb");

const router = express.Router();

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * fetch('/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/call-duration-by-date-range", (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "Start date and end date are required"));
    }

    console.log(
      "Fetching call duration report for date range:",
      startDate,
      endDate
    );

    mongo(async (db) => {
      const data = await db
        .collection("agentPerformance")
        .aggregate([
          {
            $match: {
              date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            },
          },
          {
            $lookup: {
              from: "agents",
              localField: "agentId",
              foreignField: "agentId",
              as: "agentDetails",
            },
          },
          { $unwind: "$agentDetails" },
          {
            $group: {
              _id: "$agentDetails.name",
              totalCallDuration: { $sum: "$callDuration" },
            },
          },
          {
            $project: {
              _id: 0,
              agent: "$_id",
              callDuration: "$totalCallDuration",
            },
          },
          {
            $group: {
              _id: null,
              agents: { $push: "$agent" },
              callDurations: { $push: "$callDuration" },
            },
          },
          {
            $project: {
              _id: 0,
              agents: 1,
              callDurations: 1,
            },
          },
        ])
        .toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error("Error in /call-duration-by-date-range", err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /agent-performance-by-supervisor
 *
 * Fetches agent performance data for a specific supervisor.
 *
 * Example:
 * fetch('/agent-performance-by-supervisor?supervisor=Jane')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
// GET /agent-performance-by-supervisor
router.get("/agent-performance-by-supervisor", (req, res, next) => {
  try {
    const { supervisorId } = req.query;

    // Make sure a supervisorId was provided
    if (!supervisorId) {
      return next(createError(400, "supervisorId is required"));
    }

    console.log("Fetching agent performance for supervisorId:", supervisorId);

    mongo(async (db) => {
      // Query the database
      const data = await db
        .collection("agentPerformance")
        .aggregate([
          // Only include records with this supervisorId or supervisor name
          {
            $match: ObjectId.isValid(supervisorId)
              ? { supervisorId: new ObjectId(supervisorId) }
              : { supervisor: supervisorId },
          },

          // Join with "agents" collection to get agent details
          {
            $lookup: {
              from: "agents",
              localField: "agentId",
              foreignField: "agentId",
              as: "agentDetails",
            },
          },

          // Unwind agentDetails array so each record has one agent
          { $unwind: "$agentDetails" },

          // Group by agent name and calculate averages/totals
          {
            $group: {
              _id: "$agentDetails.name",
              avgCustomerSatisfaction: {
                $avg: {
                  $first: {
                    $filter: {
                      input: "$performanceMetrics",
                      as: "metric",
                      cond: {
                        $eq: ["$$metric.metricType", "Customer Satisfaction"],
                      },
                    },
                  },
                },
              },
              avgSalesConversion: {
                $avg: {
                  $first: {
                    $filter: {
                      input: "$performanceMetrics",
                      as: "metric",
                      cond: {
                        $eq: ["$$metric.metricType", "Sales Conversion"],
                      },
                    },
                  },
                },
              },
              totalCallDuration: { $sum: "$callDuration" },
              avgResolutionTime: { $avg: "$resolutionTime" },
            },
          },

          // Simplify and format the final output
          {
            $project: {
              _id: 0,
              agent: "$_id",
              avgCustomerSatisfaction: "$avgCustomerSatisfaction.value",
              avgSalesConversion: "$avgSalesConversion.value",
              totalCallDuration: 1,
              avgResolutionTime: 1,
            },
          },
        ])
        .toArray();

      // Send the results back to the client
      res.send(data);
    }, next);
  } catch (err) {
    console.error("Error in /by-supervisor:", err);
    next(err);
  }
});

module.exports = router;
