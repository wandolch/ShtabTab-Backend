const mongoose = require('../libs/mongooseConnector');
const TransportService = require('../utils/TransportService');
const HttpError = require('../utils/HttpError');

class UserController {
  static async signIn(req, res, next) {
    const User = mongoose.models.User;
    try {
      const data = await TransportService.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.token}`);
      const googleUser = JSON.parse(data.toString('utf8'));
      const user = await User.findOne({_id: googleUser.sub});
      if (user) return res.json(user);
      const result = await new User({
        picture: googleUser.picture,
        name: googleUser.name,
        email: googleUser.email,
        _id: googleUser.sub
      }).save();
      return res.json(result);
    } catch(err) {
      next(new HttpError(500, err.message))
    }
  }
}

module.exports = UserController;