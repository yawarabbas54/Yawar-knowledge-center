'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
class JsonStore {
  constructor(directory) { this.directory = path.resolve(directory); }
  async ensure() { await fs.mkdir(this.directory, { recursive: true }); }
  file(name) { if (!/^[a-z0-9_-]+\.json$/i.test(name)) throw new Error('Invalid data filename'); return path.join(this.directory, name); }
  async read(name, fallback = []) {
    await this.ensure();
    try { return JSON.parse(await fs.readFile(this.file(name), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return fallback; if (error instanceof SyntaxError) throw new Error(`Data file ${name} is invalid JSON`); throw error; }
  }
  async write(name, value) {
    await this.ensure(); const target = this.file(name); const temp = `${target}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(value, null, 2), { mode: 0o600 }); await fs.rename(temp, target); return value;
  }
}
module.exports = { JsonStore };
