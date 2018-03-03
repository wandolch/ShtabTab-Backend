module.exports = {
  port: 8080,
  mongoose: {
    uri: "mongodb://localhost:32768/shtabTab",
    options: {
      keepAlive: 1
    }
  },
};