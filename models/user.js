const mongoose = require('../libs/mongooseConnector');
const util = require('util');

module.exports.createUser = () => {
  const schema = new mongoose.Schema({
    hash: {
      type: String,
      unique: true,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
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


  function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);
    this.message = message;
  }

  util.inherits(AuthError, Error);

  AuthError.prototype.name = 'AuthError';
};