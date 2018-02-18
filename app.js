"use strict";

const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const corsOptions = {
  origin: 'http://localhost:5000',
  optionsSuccessStatus: 200,
  credentials: true
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({
    width: 1366,
    height: 768,
    isLandscape: true
  });
  await page.goto('https://habrahabr.ru');
  await page.keyboard.type('W', {delay: 1000});
  await page.screenshot({path: 'public/img/habr.png', clip: { x: 0, y:0, width: 1366, height: 150}});
  await browser.close();
})();

app.use(cors(corsOptions));
app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

routes(app);

app.listen(port, () => {
  console.log('We are live on ' + port);
});


function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0);
        break;
      case g:
        h = ((b - r) / diff) + 2;
        break;
      case b:
        h = ((r - g) / diff) + 4;
    }
    h /= 6;
  }
  h *= 360;
  s = `${s * 100}%`;
  l = `${l * 100}%`;
  return [h, s, l];
}