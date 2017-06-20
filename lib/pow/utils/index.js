'use strict';

if (process.env.TEST_ENV === 'browser') {
  module.exports = require('./browser');
  return;
}

const crypto = require('crypto');
const Buffer = require('buffer').Buffer;

exports.EMPTY_BUFFER = Buffer.alloc(0);

exports.allocBuffer = function allocBuffer(size) {
  return Buffer.alloc(size);
};

exports.readUInt32 = function readUInt32(buffer, off) {
  return buffer.readUInt32LE(off);
};

exports.writeUInt32 = function writeUInt32(buffer, value, off) {
  buffer.writeUInt32LE(value, off, true);
  return off + 4;
};

exports.writeTimestamp = function writeTimestamp(buffer, ts, off) {
  const hi = (ts / 0x100000000) >>> 0;
  const lo = (ts & 0xffffffff) >>> 0;

  buffer.writeUInt32BE(hi, off, true);
  buffer.writeUInt32BE(lo, off + 4, true);

  return off + 8;
};

exports.readTimestamp = function readTimestamp(buffer, off) {
  return (buffer.readUInt32BE(off) * 0x100000000) +
          buffer.readUInt32BE(off + 4);
};

exports.hash = function hash(nonce, prefix) {
  const h = crypto.createHash('sha256');
  if (prefix)
    h.update(prefix);
  h.update(nonce);
  return h.digest();
};

exports.checkComplexity = require('./common').checkComplexity;
