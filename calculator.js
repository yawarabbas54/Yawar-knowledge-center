'use strict';
// A deliberately small arithmetic parser. Never use eval() for user input.
function calculate(expression) {
  if (typeof expression !== 'string' || expression.length > 120) throw new Error('Enter a short arithmetic expression.');
  const rawTokens = expression.match(/(?:\d+(?:\.\d+)?|[()+\-*/%]|\s+)/g);
  if (!rawTokens || rawTokens.join('') !== expression) throw new Error('Only numbers, parentheses, +, -, *, /, and % are supported.');
  const tokens = rawTokens.filter(token => !/^\s+$/.test(token));
  // Adjacent numeric tokens such as `2 3` must not silently become `23`.
  for (let j = 1; j < tokens.length; j++) {
    if (/^\d/.test(tokens[j - 1]) && /^\d/.test(tokens[j])) throw new Error('Missing operator between numbers.');
  }
  let i = 0;
  function primary() {
    const t = tokens[i++];
    if (t === '+') return primary(); if (t === '-') return -primary();
    if (t === '(') { const v = sum(); if (tokens[i++] !== ')') throw new Error('Missing closing parenthesis.'); return v; }
    const n = Number(t); if (!Number.isFinite(n)) throw new Error('Invalid number.'); return n;
  }
  function product() { let v = primary(); while (['*','/','%'].includes(tokens[i])) { const op=tokens[i++], r=primary(); if ((op==='/' || op==='%') && r===0) throw new Error('Division by zero is not allowed.'); v=op==='*'?v*r:op==='/'?v/r:v%r; } return v; }
  function sum() { let v=product(); while (tokens[i]==='+' || tokens[i]==='-') { const op=tokens[i++], r=product(); v=op==='+'?v+r:v-r; } return v; }
  const result=sum(); if (i !== tokens.length || !Number.isFinite(result)) throw new Error('Invalid expression.'); return result;
}
module.exports = { calculate };
