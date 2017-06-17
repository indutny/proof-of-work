'use strict';

const assert = require('assert');

const pow = require('../pow');
const utils = pow.utils;

const MIN_NONCE_SIZE = 8;

function Solver() {
}
module.exports = Solver;

Solver.prototype._genNonce = function _genNonce(buf, off) {
  const now = Date.now();

  buf.writeUInt32BE((now / 0x100000000) >>> 0, off);
  buf.writeUInt32BE(now >>> 0, off + 4);

  off += 8;
  const words = off + (((buf.length - off) / 4) | 0) * 4;

  for (; off < words; off += 4)
    buf.writeUInt32LE((Math.random() * 0x100000000) >>> 0, off, true);

  for (; off < buf.length; off++)
    buf[off] = (Math.random() * 0x100) >>> 0;
};

Solver.prototype.solve = function solve(complexity, prefix) {
  let len = MIN_NONCE_SIZE + 8;
  let off = 0;

  if (prefix) {
    len += prefix.length;
    off = prefix.length;
  }

  // 64 bits of entropy should be enough for each millisecond to avoid
  // collisions
  const nonce = Buffer.alloc(len);
  if (prefix)
    prefix.copy(nonce);

  for (;;) {
    this._genNonce(nonce, off);

    const hash = utils.hash(nonce);

    if (utils.checkComplexity(hash, complexity))
      return nonce;
  }
};
