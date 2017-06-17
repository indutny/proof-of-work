'use strict';

const assert = require('assert');
const crypto = require('crypto');

const pow = require('../pow');
const utils = pow.utils;

const MIN_NONCE_SIZE = 8;

function Solver() {
}
module.exports = Solver;

Solver.prototype._genNonce = function _genNonce(buf) {
  const now = Date.now();

  buf.writeUInt32BE((now / 0x100000000) >>> 0, 0);
  buf.writeUInt32BE(now >>> 0, 4);

  var off = 8;
  const words = off + (((buf.length - off) / 4) | 0) * 4;

  for (; off < words; off += 4)
    buf.writeUInt32LE((Math.random() * 0x100000000) >>> 0, off, true);

  for (; off < buf.length; off++)
    buf[off] = (Math.random() * 0x100) >>> 0;
};

Solver.prototype.solve = function solve(complexity) {
  let size = MIN_NONCE_SIZE + 4;
  let nonce = Buffer.alloc(size);
  let limit = 0x10000;
  let counter = 0;

  for (let counter = 0;; counter++) {
    if (counter > limit) {
      size++;
      limit *= 0x100;
      counter = 0;
      nonce = Buffer.alloc(size);
    }
    this._genNonce(nonce);

    const hash = crypto.createHash('sha256').update(nonce).digest();

    if (utils.checkComplexity(hash, complexity))
      return nonce;
  }
};
