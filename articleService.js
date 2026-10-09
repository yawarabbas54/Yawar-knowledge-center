'use strict';

const { randomUUID } = require('node:crypto');
const { HttpError } = require('../utils/httpError');

/**
 * In-memory article store. Replace the internals with a database
 * adapter later without changing the routes.
 */
class ArticleService {
  constructor() {
    this.articles = new Map();
  }

  list({ tag, search } = {}) {
    let items = [...this.articles.values()];

    if (tag) {
      const normalizedTag = tag.trim().toLowerCase();
      items = items.filter((article) => article.tags.includes(normalizedTag));
    }

    if (search) {
      const query = search.trim().toLowerCase();
      items = items.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      );
    }

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id) {
    const article = this.articles.get(id);
    if (!article) {
      throw new HttpError(404, 'Article not found');
    }
    return article;
  }

  create({ title, content, tags = [] }) {
    const now = new Date().toISOString();
    const article = {
      id: randomUUID(),
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
    };
    this.articles.set(article.id, article);
    return article;
  }

  update(id, changes) {
    const existing = this.get(id);
    const updated = {
      ...existing,
      ...changes,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  remove(id) {
    this.get(id);
    this.articles.delete(id);
  }

  clear() {
    this.articles.clear();
  }
}

module.exports = { ArticleService };
