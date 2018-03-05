const mongoose = require('./libs/mongooseConnector');

(async () => {
  try {
    await mongoose.connection.on('open');
    const db = mongoose.connection.db;
    await db.dropDatabase();
  } catch(err){
    console.log(JSON.stringify(err));
    mongoose.disconnect();
  }
})();