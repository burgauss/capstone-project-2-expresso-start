const express = require('express');
const sqlite = require('sqlite3');
const { ModuleFilenameHelpers } = require('webpack');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const employeesRouter = express.Router();


module.exports = employeesRouter;