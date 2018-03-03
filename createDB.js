const mongoose = require('./libs/mongooseConnector');
const async = require('async');

async.series([
  open,
  dropDatabase,
  requireModels,
], function (err) {
  console.log(JSON.stringify(err));
  mongoose.disconnect();
});

function open(callback) {
  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  require('./models').createModels();
  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}