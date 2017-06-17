'use strict';

const crypto = require('crypto');

const pow = require('../pow');
const utils = pow.utils;
const Bloom = pow.Bloom;

const MIN_NONCE_LEN = 8;
const MAX_NONCE_LEN = 32;
const DEFAULT_VALIDITY = 60000;

function Verifier(options) {
  const bloom = () => {
    return new Bloom(options.size,
                     options.n,
                     (Math.random() * 0x100000000) >>> 0);
  };

  this.blooms = [
    bloom(), bloom()
  ];
  this.complexity = options.complexity;
  this.validity = options.validity || DEFAULT_VALIDITY;
}
module.exports = Verifier;

Verifier.prototype._readTimestamp = function _readTimestamp(nonce) {
  return (nonce.readUInt32BE(0) * 0x100000000) +
         nonce.readUInt32BE(4);
};

Verifier.prototype.check = function check(nonce) {
  if (nonce.length < MIN_NONCE_LEN)
    return false;
  if (nonce.length > MAX_NONCE_LEN)
    return false;

  const ts = this._readTimestamp(nonce);
  const now = Date.now();

  if (Math.abs(ts - now) > this.validity)
    return false;

  for (let i = 0; i < this.blooms.length; i++)
    if (this.blooms[i].test(nonce))
      return false;

  const hash = crypto.createHash('sha256').update(nonce).digest();

  if (!utils.checkComplexity(hash, this.complexity))
    return false;

  this.blooms[0].add(nonce);
  return true;
};

Verifier.prototype.reset = function reset() {
  this.blooms[1].reset();

  // Swap filters
  const tmp = this.blooms[0];
  this.blooms[0] = this.blooms[1];
  this.blooms[1] = tmp;
};
