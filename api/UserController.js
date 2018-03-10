const mongoose = require('mongoose');
const TransportService = require('../utils/TransportService');
const HttpError = require('../utils/HttpError');
const jwt = require('jsonwebtoken');

class UserController {
  static async signIn(req, res, next) {
    const User = mongoose.models.User;
    try {
      const data = await TransportService.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.token}`);
      const googleUser = JSON.parse(data.toString('utf8'));
      const userData = {
        picture: googleUser.picture,
        givenName: googleUser.given_name,
        familyName: googleUser.family_name,
        fullName: googleUser.name,
        email: googleUser.email
      };
      let user = await User.findOne({email: userData.email});
      if (user) {
        const token = jwt.sign(user.toJSON(), process.env.JWT_KEY);
        return res.json(Object.assign(user.toJSON(), {token}));
      }
      user = await new User(userData).save();
      const token = jwt.sign(user.toJSON(), process.env.JWT_KEY);
      return res.json(Object.assign(user.toJSON(), {token}));
    } catch(err) {
      next(new HttpError(500, err.message))
    }
  }
}

module.exports = UserController;