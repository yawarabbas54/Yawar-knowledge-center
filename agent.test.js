'use strict';
const test=require('node:test'); const assert=require('node:assert/strict'); const {calculate}=require('../src/tools/calculator');
test('calculator respects operator precedence',()=>assert.equal(calculate('2 + 3 * 4'),14));
test('calculator supports parentheses and unary minus',()=>assert.equal(calculate('-(2 + 3) * 2',),-10));
test('calculator rejects code injection',()=>assert.throws(()=>calculate('process.exit()')));
test('calculator rejects division by zero',()=>assert.throws(()=>calculate('10 / 0'),/zero/));
test('calculator rejects trailing tokens',()=>assert.throws(()=>calculate('1 + 2 3')));
