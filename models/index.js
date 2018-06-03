module.exports.createModels = () => {
  require('./user').createUser();
  require('./collection').createCollection();
  require('./bookmark').createCollection();
};