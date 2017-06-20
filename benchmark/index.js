'use strict';

const benchmark = require('benchmark');
const suite = new benchmark.Suite();

const COMPLEXITY = 20;

const pow = require('../');
const solver = new pow.Solver();
const verifier = new pow.Verifier({ complexity: COMPLEXITY });

const nonce = solver.solve(COMPLEXITY);

suite
  .add('verify', () => {
    verifier.check(nonce);

    // This slows things down, but it is ok
    verifier.reset();
    verifier.reset();
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .run();
