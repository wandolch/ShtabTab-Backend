const mongoose = require('mongoose');
const serverConfig = require('../constants/serverConfig');

mongoose.connect(serverConfig.mongoose.uri, serverConfig.mongoose.options);

module.exports = mongoose;