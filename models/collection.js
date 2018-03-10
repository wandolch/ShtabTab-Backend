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
    index: {
      type: Number,
      required: true
    },
    created: {
      type: Date,
      default: Date.now
    },
    creatorId: {
      type: String,
      ref: 'User',
      required: true
    },
  });

  mongoose.model('Collection', schema);
};