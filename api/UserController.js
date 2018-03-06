const mongoose = require('../libs/mongooseConnector');
const TransportService = require('../utils/TransportService');
const HttpError = require('../utils/HttpError');
const jwt = require('jsonwebtoken');

class UserController {
  static async signIn(req, res, next) {
    const User = mongoose.models.User;
    try {
      const data = await TransportService.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.token}`);
      const googleUser = JSON.parse(data.toString('utf8'));
      const user = {
        picture: googleUser.picture,
        name: googleUser.name,
        email: googleUser.email,
        _id: googleUser.sub
      };
      const token = jwt.sign(user, process.env.JWT_KEY);
      if (await User.findById(googleUser.sub)) return res.json(Object.assign(user, {token}));
      await new User(user).save();
      return res.json(Object.assign(user, {token}));
    } catch(err) {
      next(new HttpError(500, err.message))
    }
  }
}

module.exports = UserController;