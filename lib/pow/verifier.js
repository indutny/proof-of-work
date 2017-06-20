'use strict';

const pow = require('../pow');
const utils = pow.utils;
const Bloom = pow.Bloom;

const HAS_BUFFER = utils.HAS_BUFFER;

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
  this.prefix = options.prefix || utils.EMPTY_BUFFER;
}
module.exports = Verifier;

Verifier.prototype._readTimestamp = function _readTimestamp(nonce, off) {
  return (nonce.readUInt32BE(off) * 0x100000000) +
         nonce.readUInt32BE(off + 4);
};

// Fallback for browsers
if (!HAS_BUFFER) {
  Verifier.prototype._readTimestamp = function _readTimestamp(nonce, off) {
    const hi = (nonce[off] << 24) | (nonce[off + 1] << 16) |
               (nonce[off + 2] << 8) | nonce[off + 3];
    const lo = (nonce[off + 4] << 24) | (nonce[off + 5] << 16) |
               (nonce[off + 6] << 8) | nonce[off + 7];
    return ((hi >>> 0) * 0x100000000) + (lo >>> 0);
  };
}

Verifier.prototype.check = function check(nonce) {
  const prefix = this.prefix;

  if (nonce.length < MIN_NONCE_LEN)
    return false;
  if (nonce.length > MAX_NONCE_LEN)
    return false;

  const ts = this._readTimestamp(nonce, 0);
  const now = Date.now();

  if (Math.abs(ts - now) > this.validity)
    return false;

  for (let i = 0; i < this.blooms.length; i++)
    if (this.blooms[i].test(nonce))
      return false;

  const hash = utils.hash(nonce, prefix);

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
