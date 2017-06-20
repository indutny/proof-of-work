'use strict';

const sha256 = require('hash.js/lib/hash/sha/256');

exports.EMPTY_BUFFER = [];

exports.allocBuffer = function allocBuffer(size) {
  const res = new Array(size);
  for (let i = 0; i < res.length; i++)
    res[i] = 0;
  return res;
};

function readUInt32(buffer, off) {
  return ((buffer[off] << 24) | (buffer[off + 1] << 16) |
          (buffer[off + 2] << 8) | buffer[off + 3]) >>> 0;
}

function writeUInt32(buffer, value, off) {
  buffer[off] = (value >>> 24) & 0xff;
  buffer[off + 1] = (value >>> 16) & 0xff;
  buffer[off + 2] = (value >>> 8) & 0xff;
  buffer[off + 3] = value & 0xff;

  return off + 4;
}

exports.readUInt32 = readUInt32;
exports.writeUInt32 = writeUInt32;

exports.writeTimestamp = function writeTimestamp(buffer, ts, off) {
  const hi = (ts / 0x100000000) >>> 0;
  const lo = (ts & 0xffffffff) >>> 0;

  off = writeUInt32(buffer, hi, off);
  return writeUInt32(buffer, lo, off);
};

exports.readTimestamp = function readTimestamp(buffer, off) {
  return readUInt32(buffer, off) * 0x100000000 + readUInt32(buffer, off + 4);
};

exports.hash =  function hash(nonce, prefix) {
  const h = sha256();
  if (prefix)
    h.update(prefix);
  h.update(nonce);
  return h.digest();
};

exports.checkComplexity = require('./common').checkComplexity;
