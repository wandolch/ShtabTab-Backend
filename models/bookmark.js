const mongoose = require('mongoose');
const shortId = require('shortid');

module.exports.createCollection = () => {
  const schema = new mongoose.Schema({
    id: {
      type: String,
      default: shortId.generate
    },
    title: {
      type: String,
      required: true
    },
    hostName: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    frequency: {
      type: Number,
      default: 0
    },
    created: {
      type: Date,
      default: Date.now
    },
    collectionId: {
      type: String,
      ref: 'Collection',
      required: true
    },
    creatorId: {
      type: String,
      ref: 'User',
      required: true
    },
    picture: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    rgb: {
      type: [Number],
      required: true
    },
    topics: {
      type: [String]
    }
  });

  mongoose.model('Bookmark', schema);
};