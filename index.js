'use strict';
require('dotenv').config();
const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  apiKey: process.env.API_KEY || '',
  dataDir: process.env.DATA_DIR || './data',
  aiBaseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  maxAgentSteps: Math.min(8, Math.max(1, Number.parseInt(process.env.MAX_AGENT_STEPS || '4', 10) || 4)),
  webSearchUrl: process.env.WEB_SEARCH_URL || '',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || ''
});
module.exports = config;
