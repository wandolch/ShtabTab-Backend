const mongoose = require('./libs/mongooseConnector');

mongoose.connection.on('open', async () => {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log('Dropped!');
  } catch (err) {
    console.log(err);
  } finally {
    setTimeout(() => {
      mongoose.disconnect();
      console.log('Disconnected!');
    }, 1000);
  }
});
