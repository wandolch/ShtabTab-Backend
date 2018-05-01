const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');
const puppeteer = require('puppeteer');
const Vibrant = require('node-vibrant');

class BookmarkController {
  static async createBookmarkByCollectionId(req, res, next) {
    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;

    const collectionId = req.params.id;
    try {
      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});
      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }

      const bookmarksInCollection = await Bookmark
        .find({collectionId})
        .exec();

      let bookmark = new Bookmark({
        collectionId,
        creatorId: req.userData.id,
        link: getValidLink(req.body.link),
        index: bookmarksInCollection.length,
        hostName: extractHostname(req.body.link),
        frequency: randomInteger(0, 2)
      });
      const browser = await puppeteer.launch();
      let pictureBuffer;
      try {
        const page = await browser.newPage();
        page.setViewport({
          width: 1366,
          height: 768,
          isLandscape: true
        });
        await page.goto(bookmark.link);
        await page.keyboard.type(' ', {delay: 1000});
        pictureBuffer = await page.screenshot({clip: {x: 0, y: 0, width: 1366, height: 170}});
        bookmark.picture = Buffer.from(pictureBuffer).toString('base64');
        const title = await page.title();
        if (title) bookmark.title = title;
        else bookmark.title = bookmark.hostName.split('.')[0];
      } catch (err) {
        bookmark.title = bookmark.hostName.split('.')[0];
      }
      browser.close();
      const vibrantOpt = {
        colorCount: 10,
        //filters: [(r, g, b) => (r + g + b) < 665]
      };
      let palette = await new Vibrant(`http://www.google.com/s2/favicons?domain=${bookmark.link}`, vibrantOpt).getPalette();
      bookmark.rgb = getVibrantColor(palette);
      if (!bookmark.rgb && pictureBuffer) {
        palette = await new Vibrant(pictureBuffer, vibrantOpt).getPalette();
        bookmark.rgb = getVibrantColor(palette);
      }
      if (!bookmark.rgb) {
        bookmark.rgb = [3, 169, 255]; // TODO make many default colors
      } else {
        let i = 0;
        while(i < bookmark.rgb.length){
          bookmark.rgb[i] = Math.round(bookmark.rgb[i]);
          i++
        }
      }

      await bookmark.save();
      return res.json(bookmark.toJSON());

    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }

  static async deleteBookmarkById(req, res, next) {
    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    const bookmarkId = req.params.id;
    try {
      const bookmark = await Bookmark.findOne({id: bookmarkId});
      if (!bookmark) {
        return res.status(404).json(new HttpError(404, `Bookmark with id ${bookmarkId} does not exist`));
      }

      const collectionId  = bookmark.collectionId;

      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});
      if (!collection) {
        return res.status(403).json(new HttpError(403));
      }

      await bookmark.remove();

      const conditions = { collectionId, 'index' : { $gt: bookmark.index } };
      const update = { $inc: { index: -1 }};
      const options = { multi: true };

      await Bookmark.update(conditions, update, options);

      const bookmarks = await Bookmark
        .find({collectionId})
        .sort('index')
        .exec();

      return res.json(bookmarks);

    } catch(err){
      next(new HttpError(500, err.message))
    }
  }
}

function getVibrantColor(palette) {
  if (palette.Vibrant) {
    return palette.Vibrant._rgb;
  } else if (palette.DarkVibrant) {
    return palette.DarkVibrant._rgb;
  } else if (palette.LightVibrant) {
    return palette.LightVibrant._rgb;
  } else if (palette.Muted) {
    return palette.Muted._rgb;
  } else if (palette.DarkMuted) {
    return palette.DarkMuted._rgb;
  } else if (palette.LightMuted) {
    return palette.LightMuted._rgb;
  }
  return null;
}

function getValidLink(link) {
  return link.indexOf('http') !== -1 ? link : 'http://' + link;
}

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}

function extractHostname(url) {
  const regexp = /^(?:https?:\/\/)?(?:www\.)?((?:(?!www\.|\.).)+\.[a-zA-Z0-9.]+)/;
  const res = url.match(regexp);
  return res ? res[1] : '';
}

module.exports = BookmarkController;