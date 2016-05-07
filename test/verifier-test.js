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

  // 81143bdcac14d45a7b602f388aa6fcf234e5b97cd7634e3b58d93d24969b37cc
  // 7d8dca4512fd79eb275985e79ca2a2843cf6c50b35d73f13737ed3260eb5706b
  it('should verify nonce', () => {
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
  });

  it('should not allow double-verify', () => {
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
    assert(!check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
  });

  it('should not allow double-verify after one reset', () => {
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
    verifier.reset();
    assert(!check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
  });

  it('should allow double-verify after two resets', () => {
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
    verifier.reset();
    verifier.reset();
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
  });

  it('should not allow sliding double-verify after two resets', () => {
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
    verifier.reset();
    assert(check(
        '81143bdcac14d45a7b602f388aa6fcf234e5b97cd7634e3b58d93d24969b37cc'));
    verifier.reset();
    assert(check(
        '23782aa38100c73c3ec359fed2bfd17d4fa290ea9613e3725baece415ba0488a'));
    assert(!check(
        '81143bdcac14d45a7b602f388aa6fcf234e5b97cd7634e3b58d93d24969b37cc'));
  });
});
