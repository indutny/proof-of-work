'use strict';

const assert = require('assert');

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

  let off = 8;
  const words = off + (((buf.length - off) / 4) | 0) * 4;

  for (; off < words; off += 4)
    buf.writeUInt32LE((Math.random() * 0x100000000) >>> 0, off, true);

  for (; off < buf.length; off++)
    buf[off] = (Math.random() * 0x100) >>> 0;
};

Solver.prototype.solve = function solve(complexity, prefix) {
  // 64 bits of entropy should be enough for each millisecond to avoid
  // collisions
  const nonce = Buffer.alloc(MIN_NONCE_SIZE + 8);

  for (;;) {
    this._genNonce(nonce);

    const hash = utils.hash(nonce, prefix);

    if (utils.checkComplexity(hash, complexity))
      return nonce;
  }
};
