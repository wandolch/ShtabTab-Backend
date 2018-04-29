const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');

class CollectionController {
  static async getCollections(req, res, next) {
    const Collection = mongoose.models.Collection;
    try {
      const collections = await Collection
        .find({creatorId: req.userData.id})
        .sort('index')
        .exec();
      if (collections && collections.length) {
        return res.json(collections);
      }
      const defaultCollection = await new Collection({
        title: 'General',
        index: 0,
        creatorId: req.userData.id,
      }).save();
      return res.json([defaultCollection.toJSON()]);
    } catch(err) {
      next(new HttpError(500, err.message))
    }
  }

  static async getCollectionById(req, res, next){
    const collectionId = req.params.id;

    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    try {
      const collection = await Collection.findOne({id: collectionId});
      if(!collection){
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }
      const bookmarks = await Bookmark
        .find({collectionId})
        .sort('index')
        .exec();
      return res.json(bookmarks);
    } catch(err) {
      next(new HttpError(500, err.message))
    }
  }

  static async addCollection(req, res, next){
    const Collection = mongoose.models.Collection;
    try {
      const allCollections = await Collection.find().exec();
      const collection = await new Collection({
        title: req.body.title,
        index: allCollections.length,
        creatorId: req.userData.id,
      }).save();
      return res.json(collection.toJSON());
    } catch(err) {
      next(new HttpError(500, err.message))
    }
  }
}

module.exports = CollectionController;