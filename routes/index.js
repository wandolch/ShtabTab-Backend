"use strict";

module.exports = function (app) {
  app.get('/api/bookmarks', function (req, res) {
    const bookmarksArray = require('../json/bookmarks.json');
    res.status(200).send(bookmarksArray);
  });
};