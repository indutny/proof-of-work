'use strict';

const crypto = require('crypto');
const Buffer = require('buffer').Buffer;

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
  this.prefix = options.prefix || Buffer.alloc(0);
}
module.exports = Verifier;

Verifier.prototype._checkPrefix = function _checkPrefix(nonce, prefix) {
  for (let i = 0; i < prefix.length; i++)
    if (nonce[i] !== prefix[i])
      return false;
  return true;
};

Verifier.prototype._readTimestamp = function _readTimestamp(nonce, off) {
  return (nonce.readUInt32BE(off) * 0x100000000) +
         nonce.readUInt32BE(off + 4);
};

Verifier.prototype.check = function check(nonce) {
  const prefix = this.prefix;

  if (nonce.length < prefix.length + MIN_NONCE_LEN)
    return false;
  if (nonce.length > prefix.length + MAX_NONCE_LEN)
    return false;

  if (!this._checkPrefix(nonce, prefix))
    return false;

  const ts = this._readTimestamp(nonce, prefix.length);
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
