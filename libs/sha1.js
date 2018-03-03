'use strict';
const crypto = require('crypto');

module.exports = (str) => {
  const hash = crypto.createHmac('sha1', str);
  hash.update(str);
  return hash.digest('hex');
};
