'use babel';

import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';
// NOTE: import/named doesn't seem to understand module exports?
// eslint-disable-next-line import/named
import { canValidate } from '../lib/main';

describe('Test JS code', () => {
  it('Validates Swagger files', async () => {
    expect(canValidate('swagger: "2.0"')).toBe(true);
  });
  it('Validates OpenAPI files', async () => {
    expect(canValidate('openapi: "3.0.1"')).toBe(true);
  });
  it('Does not validate non-Swagger/OpenAPI files', async () => {
    expect(canValidate('notaspec: "3.0.1"')).toBe(false);
  });
});
