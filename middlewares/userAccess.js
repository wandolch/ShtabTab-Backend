const mongoose = require('../libs/mongooseConnector');

module.exports = (req, res, next) => {
  mongoose.models.User.findOne({hash: req.body.hash}, (err, user) => {
    if (err) {
      //TODO error
      throw new Error({err, message: 'findOne error'});
    }
    if (user) {
      next();
    }
  });
};