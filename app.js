"use strict";

const express = require('express');
const app = express();
const port = 8081;
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

routes(app);

app.listen(port, () => {
  console.log('We are live on ' + port);
});
