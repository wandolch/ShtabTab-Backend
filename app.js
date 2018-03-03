"use strict";
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./api');
const corsOptions = require('./constants/corsOptions');
const serverConfig = require('./constants/serverConfig');
require('./models').createModels();

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/api', apiRouter);
app.use('/public', express.static(__dirname + '/public'));

app.listen(serverConfig.port, '127.0.0.1', () => {
  console.log('We are live on ' + serverConfig.port);
});

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({
    width: 1366,
    height: 768,
    isLandscape: true
  });
  await page.goto('https://www.behance.net/');
  await page.keyboard.type('', {delay: 1500});
  await page.screenshot({path: 'public/img/behance.png', clip: {x: 0, y: 0, width: 1366, height: 170}});
  await browser.close();
})();