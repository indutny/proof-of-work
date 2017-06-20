'use strict';

const assert = require('minimalistic-assert');
let crypto;
let Buffer;
try {
  crypto = require('crypto');
} catch (e) {
}

try {
  Buffer = require('buffer').Buffer;
} catch (e) {
}

const HAS_CRYPTO = !!(crypto && crypto.createHash);
const HAS_BUFFER = !!Buffer;

let hash;
if (!HAS_CRYPTO)
  hash = require('hash.js');

exports.HAS_CRYPTO = HAS_CRYPTO;
exports.HAS_BUFFER = HAS_BUFFER;
exports.EMPTY_BUFFER = HAS_BUFFER ? Buffer.alloc(0) : new Uint8Array(0);

exports.allocBuffer = HAS_BUFFER ? function allocBuffer(size) {
  return Buffer.alloc(size);
} : function allocBuffer(size) {
  const res = new Array(size);
  for (let i = 0; i < res.length; i++)
    res[i] = 0;
  return res;
}

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
  return h.digest();
};
