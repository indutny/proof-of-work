'use strict';

const assert = require('assert');
const Buffer = require('buffer').Buffer;

const pow = require('../');
const utils = pow.utils;

const fixtures = require('./fixtures');
const parseHex = fixtures.parseHex;

describe('POW/Utils', () => {
  describe('complexity', () => {
    const check = (hex, complexity) => {
      return utils.checkComplexity(parseHex(hex, 'hex'), complexity);
    };
    it('should work on complexity=0', () => {
      assert(check('ffff', 0));
    });

    it('should work on complexity=3', () => {
      assert(check('1fff', 3));
      assert(!check('3fff', 3));
    });

    it('should work on complexity=8', () => {
      assert(check('00ff', 8));
      assert(!check('01ff', 8));
    });

    it('should work on complexity=19', () => {
      assert(check('00001f', 19));
      assert(!check('00003f', 19));
    });
  });
});
