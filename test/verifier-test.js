'use strict';
/* global describe it beforeEach afterEach */

const assert = require('assert');
const Buffer = require('buffer').Buffer;

const pow = require('../');
const utils = pow.utils;
const Verifier = pow.Verifier;

const COMPLEXITY = 16;
const HIGH_COMPLEXITY = 18;

describe('POW/Verifier', () => {
  let verifier;

  beforeEach(() => {
    verifier = new Verifier({
      size: 1024,
      n: 16,
      complexity: COMPLEXITY
    });
  });

  afterEach(() => {
    verifier = null;
  });

  const check = (hex, complexity) => {
    return verifier.check(Buffer.from(hex, 'hex'), complexity);
  };

  const nonce = (prefix, complexity) => {
    const solver = new pow.Solver();

    complexity = complexity || COMPLEXITY;

    for (;;) {
      const nonce = solver.solve(complexity, prefix);

      // Just for the purpose of testing
      if (!utils.checkComplexity(utils.hash(nonce, prefix), complexity + 1))
        return nonce;
    }
  };

  const nonce1 = nonce();
  const nonce2 = nonce();
  const complexNonce = nonce(null, HIGH_COMPLEXITY);
  const prefixedNonce = nonce(Buffer.from('deadbeef', 'hex'));
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

  it('should check prefix', () => {
    assert(!check(prefixedNonce));

    const verifier1 = new Verifier({
      size: 1024,
      n: 16,
      complexity: COMPLEXITY,
      prefix: Buffer.from('deadbeef', 'hex')
    });

    assert(verifier1.check(prefixedNonce));

    const verifier2 = new Verifier({
      size: 1024,
      n: 16,
      complexity: COMPLEXITY,
      prefix: Buffer.from('abbadead', 'hex')
    });

    assert(!verifier2.check(prefixedNonce));
  });

  it('should verify nonce with higher complexity', () => {
    assert(check(complexNonce));
  });

  it('should verify with overridable complexity', () => {
    assert(check(complexNonce, HIGH_COMPLEXITY));
    assert(!check(nonce1, HIGH_COMPLEXITY));
  });

  it('should fail on too short nonce', () => {
    assert(!verifier.check(Buffer.alloc(7)));
  });

  it('should fail on too long nonce', () => {
    assert(!verifier.check(Buffer.alloc(33)));
  });
});
