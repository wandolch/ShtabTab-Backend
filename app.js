"use strict";
const express = require('express');
const app = express();
const morgan = require("morgan");
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./api');
const corsOptions = require('./constants/corsOptions');
const serverConfig = require('./constants/serverConfig');
require('./models').createModels();

app.use(morgan(process.env.DEV ? 'dev' : 'combined'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/api', apiRouter);
app.use('/public', express.static(__dirname + '/public'));

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

// const puppeteer = require('puppeteer');
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   page.setViewport({
//     width: 1366,
//     height: 768,
//     isLandscape: true
//   });
//   await page.goto('https://www.behance.net/');
//   await page.keyboard.type(' ', {delay: 1000});
//   await page.screenshot({path: 'public/img/behance.png', clip: {x: 0, y: 0, width: 1366, height: 170}});
//   await browser.close();
//   console.log('done');
// })();