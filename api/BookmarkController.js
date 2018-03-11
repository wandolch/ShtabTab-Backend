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

      const bookmarksInCollection = await Bookmark
        .find({collectionId})
        .exec();

      let bookmark = new Bookmark({
        collectionId,
        creatorId: req.userData.id,
        link: req.body.link,
        index: bookmarksInCollection.length,
        hostName: extractHostname(req.body.link)
      });
      bookmark.picture = `public/img/${bookmark.id}.png`;
      const browser = await puppeteer.launch();
      try {
        const page = await browser.newPage();
        page.setViewport({
          width: 1366,
          height: 768,
          isLandscape: true
        });
        await page.goto(bookmark.link);
        await page.keyboard.type(' ', {delay: 1000});
        await page.screenshot({path: bookmark.picture, clip: {x: 0, y: 0, width: 1366, height: 170}});
        const title = await page.title();
        if (title) bookmark.title = title;
        else bookmark.title = bookmark.hostName.split('.')[0];
      } catch (err) {
        bookmark.title = bookmark.hostName.split('.')[0];
        bookmark.picture = null;
      }
      browser.close();

      let colors = await getColors(`http://www.google.com/s2/favicons?domain=${bookmark.link}`);
      colors = colors.filter(color => {
        return (color._rgb[0] + color._rgb[1] + color._rgb[2]) < 665
      });
      bookmark.rgb = colors[0]._rgb.slice(0, 3);
      await bookmark.save();
      return res.json(bookmark.toJSON());

    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }
}

function extractHostname(url) {
  const regexp = /^(?:https?:\/\/)?(?:www\.)?((?:(?!www\.|\.).)+\.[a-zA-Z0-9.]+)/;
  const res = url.match(regexp);
  return res ? res[1] : '';
}

module.exports = BookmarkController;