'use strict';

const assert = require('assert');
const Buffer = require('buffer').Buffer;

const pow = require('../');
const Bloom = pow.Bloom;

describe('POW/Bloom', () => {
  let bloom;

  beforeEach(() => {
    bloom = new Bloom(1024, 12, 0);
  });

  afterEach(() => {
    bloom = null;
  });

  it('should find value that is present', () => {
    bloom.add(Buffer.from('hello'));

    assert(bloom.test(Buffer.from('hello')));
  });

  it('should not find value that is not present', () => {
    bloom.add(Buffer.from('hello'));

    assert(!bloom.test(Buffer.from('ohai')));
  });

  it('should reset filter', () => {
    bloom.add(Buffer.from('hello'));
    bloom.reset();

    assert(!bloom.test(Buffer.from('hello')));
  });
});
