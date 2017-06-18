'use strict';

const assert = require('assert');
const Buffer = require('buffer').Buffer;

let crypto;
let hash;
try {
  crypto = require('crypto');
} catch (e) {
}

const HAS_CRYPTO = !!(crypto && crypto.createHash);
if (!HAS_CRYPTO)
  hash = require('hash.js');

exports.checkComplexity = function checkComplexity(hash, complexity) {
  assert(complexity < hash.length * 8, 'Complexity is too high');

  let off = 0;
  let i;
  for (i = 0; i <= complexity - 8; i += 8, off++) {
    if (hash[off] !== 0)
      return false;
  }

  const mask = 0xff << (8 + i - complexity);
  return (hash[off] & mask) === 0;
};

exports.hash = HAS_CRYPTO ? (nonce, prefix) => {
  const h = crypto.createHash('sha256')
  if (prefix)
    h.update(prefix);
  h.update(nonce);
  return h.digest();
} : (nonce, prefix) => {
  const h = hash.sha256();
  if (prefix)
    h.update(prefix);
  h.update(nonce);
  return Buffer.from(h.digest());
};
