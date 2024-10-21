const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./api/api.js');
const errorHandler = require('./errorhandler/errorhandler.js');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.use(errorHandler)

app.listen(PORT, () =>{
    console.log(`Sever is listening on port ${PORT}`);
  });

module.exports = app;