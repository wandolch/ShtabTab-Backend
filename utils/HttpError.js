const http = require('http');

class HttpError extends Error{
  constructor(status, message) {
    super();
    this.status = status || 500;
    this.message = message || http.STATUS_CODES[status] || "Error";
  }
}

module.exports = HttpError;