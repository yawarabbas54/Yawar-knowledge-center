'use strict';
const config = require('../config');
class AiService {
  isConfigured() { return Boolean(config.aiApiKey); }
  async chat(messages, options = {}) {
    if (!this.isConfigured()) return { content: this.localFallback(messages), provider: 'local-fallback', model: 'built-in', configured: false };
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(`${config.aiBaseUrl}/chat/completions`, {
        method: 'POST', signal: controller.signal,
        headers: { 'Authorization': `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: config.aiModel, messages: messages.slice(-20), temperature: options.temperature ?? 0.4, max_tokens: 1200 })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { const err = new Error(data.error?.message || `AI provider returned HTTP ${response.status}`); err.status = response.status === 429 ? 503 : 502; throw err; }
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) throw Object.assign(new Error('AI provider returned an empty response'), { status: 502 });
      return { content, provider: config.aiBaseUrl, model: data.model || config.aiModel, configured: true };
    } finally { clearTimeout(timeout); }
  }

  async chatWithTools(messages, tools, executeTool, maxSteps = 4) {
    if (!this.isConfigured()) return { content: this.localFallback(messages), provider: 'local-fallback', model: 'built-in', configured: false, toolCalls: [] };
    const conversation = messages.slice(-20).map(m => ({ ...m }));
    const toolCalls = [];
    for (let step = 0; step < maxSteps; step++) {
      const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 45000);
      let response, data;
      try {
        response = await fetch(`${config.aiBaseUrl}/chat/completions`, {
          method: 'POST', signal: controller.signal,
          headers: { 'Authorization': `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: config.aiModel, messages: conversation, tools, tool_choice: 'auto', temperature: 0.3, max_tokens: 1200 })
        });
        data = await response.json().catch(() => ({}));
      } finally { clearTimeout(timeout); }
      if (!response.ok) { const err = new Error(data.error?.message || `AI provider returned HTTP ${response.status}`); err.status = response.status === 429 ? 503 : 502; throw err; }
      const assistant = data.choices?.[0]?.message;
      if (!assistant) throw Object.assign(new Error('AI provider returned an empty response'), { status: 502 });
      conversation.push(assistant);
      if (!assistant.tool_calls?.length) return { content: assistant.content || 'The model returned no text.', provider: config.aiBaseUrl, model: data.model || config.aiModel, configured: true, toolCalls };
      for (const call of assistant.tool_calls) {
        if (call.type !== 'function' || !call.function) continue;
        let args;
        try { args = JSON.parse(call.function.arguments || '{}'); }
        catch { args = {}; }
        let result;
        try { result = await executeTool(call.function.name, args); }
        catch (error) { result = { error: error.message || 'Tool execution failed.' }; }
        toolCalls.push({ name: call.function.name, result });
        conversation.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result).slice(0, 6000) });
      }
    }
    conversation.push({ role: 'system', content: 'Tool-call limit reached. Summarize what was completed and state any remaining steps.' });
    const final = await this.chat(conversation);
    return { ...final, toolCalls };
  }
  localFallback(messages) {
    const last = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const text = String(last).trim();
    if (!text) return 'Hello! I am Yawar Knowledge Center. Ask me a question, or configure AI_API_KEY in your .env file for model-powered answers.';
    if (/\b(hi|hello|hey)\b/i.test(text)) return 'Hello! I am Yawar Knowledge Center. I can help with planning, explain concepts, search your saved knowledge, and use the built-in calculator. Add AI_API_KEY to enable advanced model-powered conversation.';
    if (/\b(time|date)\b/i.test(text)) return `The server's current UTC time is ${new Date().toISOString()}.`;
    return 'I received your message, but model-powered reasoning is not configured yet. Add AI_API_KEY to your local .env file and restart the server. Meanwhile, the knowledge search, calculator, task manager, and browser voice interface work independently.';
  }
}
module.exports = { AiService };
