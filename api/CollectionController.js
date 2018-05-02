const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');

class CollectionController {
  static async getCollections(req, res, next) {
    const Collection = mongoose.models.Collection;
    try {
      const collections = await Collection
        .find({owners: req.userData.id})
        .sort('index')
        .exec();
      if (collections && collections.length) {
        return res.json(collections);
      }
      const defaultCollection = await new Collection({
        title: 'Favorites',
        index: 0,
        owners: [req.userData.id],
      }).save();
      return res.json([defaultCollection.toJSON()]);
    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }

  static async getCollectionById(req, res, next) {
    const collectionId = req.params.id;

    const Bookmark = mongoose.models.Bookmark;
    const Collection = mongoose.models.Collection;
    try {
      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});

      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }

      const bookmarks = await Bookmark
        .find({collectionId})
        .sort('index')
        .exec();
      return res.json(bookmarks);
    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }

  static async addCollection(req, res, next) {
    const Collection = mongoose.models.Collection;
    try {
      const allCollections = await Collection.find().exec();
      const collection = await new Collection({
        title: req.body.title,
        index: allCollections.length,
        owners: [req.userData.id],
      }).save();
      return res.json(collection.toJSON());
    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }

  static async shareCollectionById(req, res, next) {
    const collectionId = req.params.id;
    const email = req.body.email;

    const Collection = mongoose.models.Collection;
    const User = mongoose.models.User;
    try {
      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});
      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }

      const userToShare = await User.findOne({email});

      if (!userToShare) {
        return res.status(400).json(new HttpError(401, `There is no user with email ${email}`));
      }

      collection.owners.push(userToShare.id);
      await collection.save();
      return res.json(collection.toJSON());
    } catch (err) {
      next(new HttpError(500, err.message))
    }
  }

  static async deleteCollectionById(req, res, next) {
    const Collection = mongoose.models.Collection;
    const Bookmark = mongoose.models.Bookmark;
    const Topic = mongoose.models.Topic;
    const collectionId = req.params.id;
    try {
      const collection = await Collection.findOne({id: collectionId ,owners: req.userData.id});
      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }

      let bookmarks = await Bookmark
        .find({collectionId: collection.id})
        .exec();

      for (let bm of bookmarks){
        let topics = bm.topics;
        await bm.remove();

        if (topics.length){
          for (let topic of topics) {
            let bm = await Bookmark.findOne({topics: topic});
            if(!bm){
              let topicModel = await Topic.findOne({id: topic});
              topicModel.remove()
            }
          }
        }

      }
      await collection.remove();
    } catch(err){
      next(new HttpError(500, err.message))
    }

    return CollectionController.getCollections(req, res, next);
  }

  static async toggleStyle(req, res, next) {
    const Collection = mongoose.models.Collection;
    const collectionId = req.params.id;
    try {
      const collection = await Collection.findOne({id: collectionId, owners: req.userData.id});
      if (!collection) {
        return res.status(404).json(new HttpError(404, `Collection with id ${collectionId} does not exist`));
      }
      collection.defaultStyle = !collection.defaultStyle;
      await collection.save();
      return res.json(collection.toJSON());
    } catch(err){
      next(new HttpError(500, err.message))
    }
  }
}



module.exports = CollectionController;