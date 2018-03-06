const HttpError = require('../utils/HttpError');

class TransportService {
  static get(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? require('https') : require('http');
      const request = protocol.get(url, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new HttpError(500, 'Request error'));
        }
        const body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      });
      request.on('error', (err) => reject(err))
    })
  }
}

module.exports = TransportService;