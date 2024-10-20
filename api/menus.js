const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const menusRouter = express.Router();


module.exports = menusRouter;