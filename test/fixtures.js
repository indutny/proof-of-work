'use strict';

exports.parseHex = function parseHex(hex) {
  return Buffer.from ? Buffer.from(hex, 'hex') : new Buffer(hex, 'hex');
};
