module.exports = {
  port: process.env.DEV ? 8080: 80,
  mongoose: {
    uri: `mongodb://localhost:${process.env.DB_PORT || 32768}/shtabTab`,
    options: {
      keepAlive: 1
    }
  },
};