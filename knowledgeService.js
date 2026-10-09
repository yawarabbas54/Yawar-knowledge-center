'use strict';
const crypto = require('node:crypto');
class KnowledgeService {
  constructor(store) { this.store = store; }
  async list() { return this.store.read('knowledge.json', []); }
  async add({ title, content, tags = [] }) {
    if (typeof title !== 'string' || !title.trim() || title.length > 180) throw Object.assign(new Error('Title is required and must be under 180 characters.'), { status: 400 });
    if (typeof content !== 'string' || !content.trim() || content.length > 50000) throw Object.assign(new Error('Content is required and must be under 50,000 characters.'), { status: 400 });
    const items = await this.list(); const item = { id: crypto.randomUUID(), title: title.trim(), content: content.trim(), tags: Array.isArray(tags) ? tags.filter(t => typeof t === 'string').slice(0, 12) : [], createdAt: new Date().toISOString() };
    items.unshift(item); await this.store.write('knowledge.json', items.slice(0, 2000)); return item;
  }
  async search(query) {
    const q = String(query || '').trim().toLowerCase(); if (!q) return [];
    const terms = q.split(/\W+/).filter(Boolean).slice(0, 12); const items = await this.list();
    return items.map(item => { const hay = `${item.title} ${item.content} ${(item.tags || []).join(' ')}`.toLowerCase(); const score = terms.reduce((n, term) => n + (hay.includes(term) ? 1 : 0), 0); return { ...item, score }; }).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0, 8);
  }
}
module.exports = { KnowledgeService };
