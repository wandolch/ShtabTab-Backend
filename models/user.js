const mongoose = require('mongoose');
const shortId = require('shortid');

module.exports.createUser = () => {
  const schema = new mongoose.Schema({
    id: {
      type: String,
      default: shortId.generate,
      unique: true
    },
    givenName: {
      type: String,
      required: true
    },
    familyName: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    picture: {
      type: String,
      required: true
    },
    created: {
      type: Date,
      default: Date.now
    }
  });

  mongoose.model('User', schema);
};