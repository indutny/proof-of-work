'use strict';

const assert = require('assert');
const crypto = require('crypto');

const pow = require('../pow');
const utils = pow.utils;

const NONCE_SIZE = 32;
assert.equal(NONCE_SIZE % 4, 0);

function Solver() {
}
module.exports = Solver;

Solver.prototype._genNonce = function _genNonce(buf) {
  for (let i = 0; i < buf.length; i += 4)
    buf.writeUInt32LE((Math.random() * 0x100000000) >>> 0, i, true);
};

Solver.prototype.solve = function solve(complexity) {
  const nonce = Buffer.alloc(NONCE_SIZE);

  let hash;
  do {
    this._genNonce(nonce);

    hash = crypto.createHash('sha256').update(nonce).digest();
  } while (!utils.checkComplexity(hash, complexity));

  return nonce;
};
