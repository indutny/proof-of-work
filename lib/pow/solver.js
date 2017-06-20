'use strict';

const assert = require('minimalistic-assert');

// NOTE: We want `require('proof-of-work/lib/pow/solver')` for browser code
const utils = require('./utils');
const HAS_BUFFER = utils.HAS_BUFFER;

const MIN_NONCE_SIZE = 8;
const NONCE_SIZE = MIN_NONCE_SIZE + 8;

function Solver(buf) {
}
module.exports = Solver;

Solver.prototype._genNonce = function _genNonce(buf) {
  const now = Date.now();

  const nowHi = (now / 0x100000000) >>> 0;
  const nowLo = (now & 0xffffffff) >>> 0;
  if (HAS_BUFFER) {
    buf.writeUInt32BE(nowHi, 0);
    buf.writeUInt32BE(nowLo, 4);
  } else {
    buf[0] = (nowHi >>> 24) & 0xff;
    buf[1] = (nowHi >>> 16) & 0xff;
    buf[2] = (nowHi >>> 8) & 0xff;
    buf[3] = nowHi & 0xff;
    buf[4] = (nowLo >>> 24) & 0xff;
    buf[5] = (nowLo >>> 16) & 0xff;
    buf[6] = (nowLo >>> 8) & 0xff;
    buf[7] = nowLo & 0xff;
  }

  let off = 8;
  const words = off + (((buf.length - off) / 4) | 0) * 4;

  // Fast writes
  if (HAS_BUFFER) {
    for (; off < words; off += 4)
      buf.writeUInt32LE((Math.random() * 0x100000000) >>> 0, off, true);
  }

  // Slower writes
  for (; off < buf.length; off++)
    buf[off] = (Math.random() * 0x100) >>> 0;
};

Solver.prototype.solve = function solve(complexity, prefix) {
  // 64 bits of entropy should be enough for each millisecond to avoid
  // collisions
  const nonce = utils.allocBuffer(NONCE_SIZE);

  for (;;) {
    this._genNonce(nonce);

    const hash = utils.hash(nonce, prefix);

    if (utils.checkComplexity(hash, complexity))
      return nonce;
  }
};
