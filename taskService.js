'use strict';
const crypto = require('node:crypto');
class TaskService {
  constructor(store) { this.store = store; }
  async list() { return this.store.read('tasks.json', []); }
  async create({ title, description = '' }) {
    if (typeof title !== 'string' || !title.trim() || title.length > 180) throw Object.assign(new Error('A task title under 180 characters is required.'), { status: 400 });
    const items = await this.list(); const task = { id: crypto.randomUUID(), title: title.trim(), description: String(description).slice(0, 2000), status: 'queued', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    items.unshift(task); await this.store.write('tasks.json', items.slice(0, 1000)); return task;
  }
  async update(id, status) {
    if (!['queued','in_progress','done','blocked'].includes(status)) throw Object.assign(new Error('Unsupported task status.'), { status: 400 });
    const items = await this.list(), task = items.find(x => x.id === id); if (!task) throw Object.assign(new Error('Task not found.'), { status: 404 });
    task.status = status; task.updatedAt = new Date().toISOString(); await this.store.write('tasks.json', items); return task;
  }
}
module.exports = { TaskService };
