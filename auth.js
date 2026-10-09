'use strict';

const { timingSafeEqual } = require('node:crypto');
const config = require('../config');

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Protects write endpoints with the x-api-key header.
 * If API_KEY is not configured, requests pass through.
 */
function requireApiKey(req, res, next) {
  if (!config.apiKey) {
    return next();
  }

  const provided = req.get('x-api-key') || '';
  if (!safeEqual(provided, config.apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

module.exports = { requireApiKey };
