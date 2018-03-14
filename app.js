"use strict";
const express = require('express');
const app = express();
const morgan = require("morgan");
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./api');
const corsOptions = require('./constants/corsOptions');
const serverConfig = require('./constants/serverConfig');
require('./libs/mongooseConnector');

app.use(morgan(process.env.DEV ? 'dev' : 'combined'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/api', apiRouter);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => { // eslint-disable-line
  res.status(error.status || 500);
  res.json({message: error.message});

});

app.listen(serverConfig.port, '127.0.0.1', () => {
  console.log('We are live on ' + serverConfig.port);
});
