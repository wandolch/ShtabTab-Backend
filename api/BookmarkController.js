const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');
const puppeteer = require('puppeteer');
const getColors = require('get-image-colors');

class BookmarkController {
  static async createBookmarkByCollectionId(req, res, next) {
    const collectionId = req.params.id;

    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    try {
      const collection = await Collection.findOne({id: collectionId});
      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }
      let bookmark = new Bookmark({
        collectionId,
        creatorId: req.userData.id,
        index: req.body.index,
        link: req.body.link
      });
      bookmark.picture = `public/img/${bookmark.id}.png`;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      page.setViewport({
        width: 1366,
        height: 768,
        isLandscape: true
      });
      await page.goto(bookmark.link);
      await page.keyboard.type(' ', {delay: 1000});
      await page.screenshot({path: bookmark.picture, clip: {x: 0, y: 0, width: 1366, height: 170}});
      bookmark.title = await page.title();

      const colors = await getColors(`http://www.google.com/s2/favicons?domain=${bookmark.link}`);
      bookmark.rgb =colors[1]._rgb.slice(0,3);
      console.log( bookmark.rgb);
      await browser.close();

    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }
}

module.exports = BookmarkController;