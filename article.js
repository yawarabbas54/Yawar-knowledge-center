'use strict';

const { HttpError } = require('../utils/httpError');

const LIMITS = Object.freeze({
  TITLE_MAX: 200,
  CONTENT_MAX: 10000,
  TAGS_MAX: 10,
  TAG_LENGTH_MAX: 30,
});

/**
 * Validates and normalizes article input.
 * @param {unknown} input - Parsed request body.
 * @param {{ partial?: boolean }} options - When partial is true, only provided fields are validated.
 * @returns {{ title?: string, content?: string, tags?: string[] }}
 */
function validateArticleInput(input, { partial = false } = {}) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  const errors = [];
  const data = {};

  if (!partial || input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string');
    } else if (input.title.trim().length > LIMITS.TITLE_MAX) {
      errors.push(`title must be at most ${LIMITS.TITLE_MAX} characters`);
    } else {
      data.title = input.title.trim();
    }
  }

  if (!partial || input.content !== undefined) {
    if (typeof input.content !== 'string' || input.content.trim().length === 0) {
      errors.push('content is required and must be a non-empty string');
    } else if (input.content.length > LIMITS.CONTENT_MAX) {
      errors.push(`content must be at most ${LIMITS.CONTENT_MAX} characters`);
    } else {
      data.content = input.content.trim();
    }
  }

  if (input.tags !== undefined) {
    const validTags =
      Array.isArray(input.tags) &&
      input.tags.length <= LIMITS.TAGS_MAX &&
      input.tags.every(
        (tag) =>
          typeof tag === 'string' &&
          tag.trim().length > 0 &&
          tag.trim().length <= LIMITS.TAG_LENGTH_MAX
      );

    if (!validTags) {
      errors.push(
        `tags must be an array of up to ${LIMITS.TAGS_MAX} non-empty strings, each at most ${LIMITS.TAG_LENGTH_MAX} characters`
      );
    } else {
      data.tags = [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()))];
    }
  } else if (!partial) {
    data.tags = [];
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'Validation failed', errors);
  }

  if (partial && Object.keys(data).length === 0) {
    throw new HttpError(400, 'No valid fields provided to update');
  }

  return data;
}

module.exports = { validateArticleInput, LIMITS };
