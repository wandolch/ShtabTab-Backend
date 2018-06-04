const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');
const puppeteer = require('puppeteer');
const Vibrant = require('node-vibrant');
const TransportService = require('../utils/TransportService');

class BookmarkController {
  static async createBookmarkByCollectionId(req, res, next) {
    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;

    const collectionId = req.params.id;
    let bookmark = null;
    let megaindexPromice = null;
    try {
      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});
      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }

      const bookmarksInCollection = await Bookmark
        .find({collectionId})
        .exec();

      bookmark = new Bookmark({
        collectionId,
        creatorId: req.userData.id,
        link: getValidLink(req.body.link),
        index: bookmarksInCollection.length,
        hostName: extractHostname(req.body.link),
        frequency: randomInteger(0, 2)
      });
      megaindexPromice = TransportService.get(`http://api.megaindex.com/visrep/lda_site?key=d5caeb89efa42b0a7018d68e4b76759a&domain[]=http://${bookmark.hostName}&count=1`);
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
        while (i < bookmark.rgb.length) {
          bookmark.rgb[i] = Math.round(bookmark.rgb[i]);
          i++
        }
      }

      await bookmark.save();
      res.json(bookmark.toJSON());

    } catch (err) {
      return next(new HttpError(500, err.message))
    }
    try {
      let topics = recognize(bookmark.hostName.toLowerCase());
      if (!topics){
        topics = ['Other'];

        let megaindexRes = JSON.parse(await megaindexPromice);
        if (megaindexRes && megaindexRes.data && megaindexRes.data[0] && megaindexRes.data[0].topics
          && megaindexRes.data[0].topics[0] && megaindexRes.data[0].topics[0].t) {
          let topicsText = megaindexRes.data[0].topics[0].t.substr(1).replace('_', ' ');
          topics = topicsText.split('/');
          if (topics.length === 3){
            topics.length = 2;
          }
        }
      }

      bookmark.topics = topics;
      await bookmark.save();
    }
    catch (err) {
      console.log(err);
    }
  }

  static async deleteBookmarkById(req, res, next) {
    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    const bookmarkId = req.params.id;
    let topics = null;
    try {
      const bookmark = await Bookmark.findOne({id: bookmarkId});
      if (!bookmark) {
        return res.status(404).json(new HttpError(404, `Bookmark with id ${bookmarkId} does not exist`));
      }

      const collectionId = bookmark.collectionId;

      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});
      if (!collection) {
        return res.status(403).json(new HttpError(403));
      }
      await bookmark.remove();

      const conditions = {collectionId, 'index': {$gt: bookmark.index}};
      const update = {$inc: {index: -1}};
      const options = {multi: true};

      await Bookmark.update(conditions, update, options);

      const bookmarks = await Bookmark
        .find({collectionId})
        .sort('index')
        .exec();

      res.json(bookmarks);

    } catch (err) {
      return next(new HttpError(500, err.message))
    }
  }

  static async getBookmarksByTopics(req, res, next) {
    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    let topics = req.body.topics;
    let toFind = {topics: { $in : topics }};
    if (!topics || !topics.length){
      toFind = {}
    }
    try {
      const bookmarks = await Bookmark
        .find(toFind)
        .sort('index')
        .exec();

      let resultArr = [];

      for (let bm of bookmarks) {
        let collection = await Collection.findOne({id: bm.collectionId, owners: req.userData.id});
        if(collection){
          resultArr.push(bm)
        }
      }

      return res.json(resultArr);

    } catch (err) {
      return next(new HttpError(500, err.message))
    }
  }

  static async getTopics(req, res, next) {
    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    let topics = req.body.topics;
    let toFind = {topics: { $in : topics }};
    if (!topics || !topics.length){
      toFind = {}
    }
    try {
      const bookmarks = await Bookmark
        .find(toFind)
        .sort('index')
        .exec();

      let resultArr = [];

      for (let bm of bookmarks) {
        let collection = await Collection.findOne({id: bm.collectionId, owners: req.userData.id});
        if(collection){
          resultArr = [...resultArr, ...bm.topics];
        }
      }

      return res.json([ ...new Set(resultArr) ]);

    } catch (err) {
      return next(new HttpError(500, err.message))
    }
  }

  static async statistics(req, res, next) {
    let info = req.body;
    try {
      toStat(info);
      return res.json({});

    } catch (err) {
      return next(new HttpError(500, err.message))
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

function recognize(hostName) {
  if (hostName.includes('facebook') || hostName.includes('vk.com') || hostName.includes('vkontakte')
  || hostName.includes('twitter') || hostName.includes('linkedin') || hostName.includes('tumblr')) {
    return ['Social Network', 'Communications'];
  }

  if (hostName.includes('youtube')){
    return ['Social Network', 'Media', 'Video'];
  }

  if (hostName.includes('.io')){
    return ['Service', 'IT'];
  }

  if (hostName.includes('mail')){
    return ['Mail', 'Communications'];
  }

  if (hostName.includes('medium') || hostName.includes('livejournal') || hostName.includes('pinterest')){
    return ['Media', 'Blog'];
  }
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

function toStat() {
  return;
}

module.exports = BookmarkController;