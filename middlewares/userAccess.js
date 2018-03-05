const mongoose = require('../libs/mongooseConnector');
const HttpError = require('../utils/HttpError');

module.exports = (req, res, next) => {
  req.headers.authorization || next(new HttpError(403));

  const hash = req.headers.authorization.split(" ")[1];
  mongoose.models.User.findOne({hash}, (err, user) => {
    !err || next(err);
    user ? next() : next(new HttpError(403));
  });
};