'use strict';

const { Router } = require('express');
const { requireApiKey } = require('../middleware/auth');
const { validateArticleInput } = require('../models/article');

function queryString(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function createArticleRouter(service) {
  const router = Router();

  router.get('/', (req, res) => {
    const items = service.list({
      tag: queryString(req.query.tag),
      search: queryString(req.query.search),
    });
    res.json({ count: items.length, data: items });
  });

  router.get('/:id', (req, res) => {
    res.json({ data: service.get(req.params.id) });
  });

  router.post('/', requireApiKey, (req, res) => {
    const data = validateArticleInput(req.body);
    res.status(201).json({ data: service.create(data) });
  });

  router.patch('/:id', requireApiKey, (req, res) => {
    const changes = validateArticleInput(req.body, { partial: true });
    res.json({ data: service.update(req.params.id, changes) });
  });

  router.delete('/:id', requireApiKey, (req, res) => {
    service.remove(req.params.id);
    res.status(204).end();
  });

  return router;
}

module.exports = { createArticleRouter };
