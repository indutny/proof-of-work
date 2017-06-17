'use strict';

const assert = require('assert');
const Buffer = require('buffer').Buffer;

const pow = require('../');
const utils = pow.utils;
const Verifier = pow.Verifier;

const fixtures = require('./fixtures');
const parseHex = fixtures.parseHex;

describe('POW/Verifier', () => {
  let verifier;

  beforeEach(() => {
    verifier = new Verifier({
      size: 1024,
      n: 16,
      complexity: 19
    });
  });

  afterEach(() => {
    verifier = null;
  });

  const check = (hex) => {
    return verifier.check(parseHex(hex, 'hex'));
  };

  const nonce = () => {
    const solver = new pow.Solver();

    return solver.solve(19);
  };

  const nonce1 = nonce();
  const nonce2 = nonce();
  const invalid =
      '81143bdcac14d45a7b602f388aa6fcf234e5b97cd7634e3b58d93d24969b37cc';

  // 81143bdcac14d45a7b602f388aa6fcf234e5b97cd7634e3b58d93d24969b37cc
  // 7d8dca4512fd79eb275985e79ca2a2843cf6c50b35d73f13737ed3260eb5706b
  it('should verify nonce', () => {
    assert(check(nonce1));
  });

  it('should not allow double-verify', () => {
    assert(check(nonce1));
    assert(!check(nonce1));
  });

  it('should not allow double-verify after one reset', () => {
    assert(check(nonce1));
    verifier.reset();
    assert(!check(nonce1));
  });

  it('should allow double-verify after two resets', () => {
    assert(check(nonce1));
    verifier.reset();
    verifier.reset();
    assert(check(nonce1));
  });

  it('should not allow sliding double-verify after two resets', () => {
    assert(check(nonce1));
    verifier.reset();
    assert(check(nonce2));
    verifier.reset();
    assert(check(nonce1));
    assert(!check(nonce2));
  });

  it('should not allow stale nonce', () => {
    assert(!check(invalid));
  });
});
