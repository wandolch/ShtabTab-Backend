const mongoose = require('../libs/mongooseConnector');

module.exports.createCollection = () => {
  const schema = new mongoose.Schema({
    _id: {
      required: true,
      type: String
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
    }
  });

  mongoose.model('Collection', schema);
};