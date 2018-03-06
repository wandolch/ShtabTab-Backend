const HttpError = require('../utils/HttpError');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new HttpError(401));
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    req.userData = jwt.verify(token, process.env.JWT_KEY);
    next();
  } catch (err) {
    next(new HttpError(401))
  }
};