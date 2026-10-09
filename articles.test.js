'use strict';

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config');
const { createApp } = require('../src/app');
const { ArticleService } = require('../src/services/articleService');

const service = new ArticleService();
let server;
let base;

const authHeaders = { 'x-api-key': config.apiKey };

const jsonHeaders = { 'content-type': 'application/json', ...authHeaders };

function createArticle(body) {
  return fetch(base, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}

before(async () => {
  server = createApp({ service }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/articles`;
});

after(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => service.clear());

test('creates an article with trimmed title and deduplicated tags', async () => {
  const res = await createArticle({
    title: '  Intro  ',
    content: 'Hello world',
    tags: ['Guide', 'guide', 'basics'],
  });
  assert.equal(res.status, 201);

  const { data } = await res.json();
  assert.equal(data.title, 'Intro');
  assert.deepEqual(data.tags, ['guide', 'basics']);
  assert.ok(data.id);
});

test('fetches an article by id', async () => {
  const created = await (await createArticle({ title: 'A', content: 'B' })).json();

  const res = await fetch(`${base}/${created.data.id}`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.id, created.data.id);
});

test('returns 404 for an unknown article', async () => {
  const res = await fetch(`${base}/does-not-exist`);
  assert.equal(res.status, 404);
});

test('rejects invalid payloads with 400 and details', async () => {
  const res = await createArticle({ title: '', content: 42, tags: 'nope' });
  assert.equal(res.status, 400);

  const body = await res.json();
  assert.equal(body.error, 'Validation failed');
  assert.equal(body.details.length, 3);
});

test('rejects malformed JSON', async () => {
  const res = await fetch(base, {
    method: 'POST',
    headers: jsonHeaders,
    body: '{ broken',
  });
  assert.equal(res.status, 400);
});

test('updates an article with partial data', async () => {
  const created = await (await createArticle({ title: 'Old', content: 'Body' })).json();

  const res = await fetch(`${base}/${created.data.id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ title: 'New' }),
  });
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.equal(body.data.title, 'New');
  assert.equal(body.data.content, 'Body');
  assert.equal(body.data.createdAt, created.data.createdAt);
});

test('deletes an article', async () => {
  const created = await (await createArticle({ title: 'Temp', content: 'Delete me' })).json();

  const del = await fetch(`${base}/${created.data.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  assert.equal(del.status, 204);

  const check = await fetch(`${base}/${created.data.id}`);
  assert.equal(check.status, 404);
});

test('filters the list by tag and search term', async () => {
  await createArticle({ title: 'Node basics', content: 'Event loop', tags: ['node'] });
  await createArticle({ title: 'Python basics', content: 'Lists and dicts', tags: ['python'] });

  const byTag = await (await fetch(`${base}?tag=node`)).json();
  assert.equal(byTag.count, 1);
  assert.equal(byTag.data[0].title, 'Node basics');

  const bySearch = await (await fetch(`${base}?search=dicts`)).json();
  assert.equal(bySearch.count, 1);
  assert.equal(bySearch.data[0].title, 'Python basics');
});

test('health endpoint reports ok', async () => {
  const res = await fetch(base.replace('/api/articles', '/health'));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});
