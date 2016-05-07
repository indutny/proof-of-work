'use strict';

const crypto = require('crypto');

const pow = require('../pow');
const utils = pow.utils;
const Bloom = pow.Bloom;

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
}
module.exports = Verifier;

Verifier.prototype.check = function check(nonce) {
  const hash = crypto.createHash('sha256').update(nonce).digest();

  if (!utils.checkComplexity(hash, this.complexity))
    return false;

  for (let i = 0; i < this.blooms.length; i++)
    if (this.blooms[i].test(hash))
      return false;

  this.blooms[0].add(hash);
  return true;
};

Verifier.prototype.reset = function reset() {
  this.blooms[1].reset();

  // Swap filters
  const tmp = this.blooms[0];
  this.blooms[0] = this.blooms[1];
  this.blooms[1] = tmp;
};
