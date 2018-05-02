module.exports.createModels = () => {
  require('./user').createUser();
  require('./collection').createCollection();
  require('./bookmark').createCollection();
  require('./topic').createCollection();
};