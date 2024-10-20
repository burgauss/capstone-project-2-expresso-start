const express = require('express');
const artistsRouter = require('./employees.js');
const seriesRouter = require('./menus.js');

const apiRouter = express.Router();

apiRouter.use('/employees', employeesRouter);

apiRouter.use('/menus', menusRouter)


module.exports = apiRouter;