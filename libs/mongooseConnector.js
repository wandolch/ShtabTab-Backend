const mongoose = require('mongoose');
const serverConfig = require('../constants/serverConfig');
mongoose.plugin(require('@meanie/mongoose-to-json'));
mongoose.plugin(require('mongoose-unique-validator'));

mongoose.connect(serverConfig.mongoose.uri, serverConfig.mongoose.options);
mongoose.Promise = global.Promise;

mongoose.connection.on('open', () => {
  require('../models').createModels();
});

module.exports = mongoose;
