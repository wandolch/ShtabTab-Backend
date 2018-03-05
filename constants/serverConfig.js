module.exports = {
  port: process.env.NODE_ENV === 'production' ? 80: 8080,
  mongoose: {
    uri: `mongodb://localhost:${process.env.DB_PORT || 32768}/shtabTab`,
    options: {
      keepAlive: 1
    }
  },
};