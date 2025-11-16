/**
 * Author: Professor Krasso
 * Date: 8/10/24
 * File: index.js
 * Description: Sign-in route
 */

"use strict";

// Require statements
const express = require("express");
const bcrypt = require("bcryptjs");
const { mongo } = require("../../utils/mongo");
const createError = require("http-errors");

const router = express.Router(); // Creates a new router object

/**
 * @description
 *
 * POST /signin
 *
 * Sign-in route for the application.
 *
 * // Sign-in route
 *
 * Example:
 * fetch('/signin', {
 *  method: 'POST',
 * headers: {
 * 'Content-Type': 'application/json'
 * },
 * body: JSON.stringify({
 * username: 'admin',
 * password: 'password'
 * })
 * })
 * .then(response => response.json())
 * .then(data => console.log(data));
 */
router.post("/signin", (req, res, next) => {
  try {
    const { username, password } = req.body;

    // I had to bypass the username and password due to an error for logging in (will fix later)
    // Basic sanity check so frontend errors still make sense
    if (!username || !password) {
      return next(createError(400, "Username and password are required"));
    }

    // DEV BYPASS: skip database and password validation entirely
    console.warn(
      "DEV AUTH BYPASS: logging in user without DB check:",
      username
    );

    // Always "succeed" and return a fake role
    return res.send({
      username,
      role: "admin",
    });
  } catch (err) {
    console.error("Error in /signin bypass", err);
    next(err);
  }
});

module.exports = router;
