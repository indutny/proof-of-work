'use strict';
/* global describe it beforeEach afterEach */

const assert = require('assert');
const Buffer = require('buffer').Buffer;

const pow = require('../');
const Bloom = pow.Bloom;

const k1 = Buffer.from('abcd', 'hex');
const k2 = Buffer.from('beef', 'hex');

describe('POW/Bloom', () => {
  let bloom;

  beforeEach(() => {
    bloom = new Bloom(1024, 12, 0);
  });

  afterEach(() => {
    bloom = null;
  });

  it('should find value that is present', () => {
    bloom.add(k1);

    assert(bloom.test(k1));
  });

  it('should not find value that is not present', () => {
    bloom.add(k1);

    assert(!bloom.test(k2));
  });

  it('should reset filter', () => {
    bloom.add(k1);
    bloom.reset();

    assert(!bloom.test(k1));
  });
});
