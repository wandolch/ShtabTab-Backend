"use strict";

module.exports = function (app) {
  app.get('/api/bookmarks/0', function (req, res) {
    const arr = require('../json/bookmarks1.json');
    setTimeout(()=>{
      res.status(200).send(arr);
    },500)

  });

  app.get('/api/bookmarks/1', function (req, res) {
    const arr = require('../json/bookmarks2.json');
    res.status(200).send(arr);
  });

  app.get('/api/collections', function (req, res) {
    const arr = require('../json/collections.json');
    res.status(200).send(arr);
  });
};