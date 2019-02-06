'use babel';

import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';
import { join } from 'path';
// NOTE: import/named doesn't seem to understand module exports?
// eslint-disable-next-line import/named
import { provideLinter } from '../lib/main';

const { lint } = provideLinter();


describe('Linting YAML files', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-yaml');
    await atom.packages.activatePackage('linter-swagger');
  });

  it('Handles no quotes around version', async () => {
    const OPENAPI = join(__dirname, 'fixtures', 'openapi.yaml');
    const editor = await atom.workspace.open(OPENAPI);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: 'Additional properties not allowed: schema',
      location: {
        file: OPENAPI,
        position: [[11, 10], [11, 16]],
      },
    });
    expect(messages[1]).toEqual({
      severity: 'error',
      excerpt: 'Missing required property: $ref',
      location: {
        file: OPENAPI,
        position: [[11, 10], [11, 16]],
      },
    });
  });

  it('Handles correct input with no errors', async () => {
    const PETSTORE = join(__dirname, 'fixtures', 'petstore.yaml');
    const editor = await atom.workspace.open(PETSTORE);
    const messages = await lint(editor);

    expect(messages.length).toEqual(0);
  });

  it('Handles invalid type errors', async () => {
    const SAMPLE1 = join(__dirname, 'fixtures', 'sample1.yaml');
    const editor = await atom.workspace.open(SAMPLE1);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: 'No enum match for: strin',
      location: {
        file: SAMPLE1,
        position: [[17, 18], [17, 22]],
      },
    });
    expect(messages[1]).toEqual({
      severity: 'error',
      excerpt: 'Expected type array but found type string',
      location: {
        file: SAMPLE1,
        position: [[17, 18], [17, 22]],
      },
    });
  });

  it('Handles additional property errors', async () => {
    const SAMPLE2 = join(__dirname, 'fixtures', 'sample2.yaml');
    const editor = await atom.workspace.open(SAMPLE2);
    const messages = await lint(editor);

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: 'Additional properties not allowed: forma',
      location: {
        file: SAMPLE2,
        position: [[18, 18], [18, 23]],
      },
    });
  });

  it('Rejects unsupported \'anyOf\' directive', async () => {
    const SAMPLE3 = join(__dirname, 'fixtures', 'sample3.yaml');
    const editor = await atom.workspace.open(SAMPLE3);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: 'Additional properties not allowed: anyOf',
      location: {
        file: SAMPLE3,
        position: [[12, 12], [12, 17]],
      },
    });
    expect(messages[1]).toEqual({
      severity: 'error',
      excerpt: 'Missing required property: type',
      location: {
        file: SAMPLE3,
        position: [[12, 12], [12, 17]],
      },
    });
  });

  it('Handles bad reference errors', async () => {
    const SAMPLE4 = join(__dirname, 'fixtures', 'sample4.yaml');
    const editor = await atom.workspace.open(SAMPLE4);
    const messages = await lint(editor);

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: `Error resolving $ref pointer "${SAMPLE4}#/definitions/INVALIDREFERENCE". \nToken "definitions" does not exist.`,
      location: {
        file: SAMPLE4,
        position: undefined,
      },
    });
  });

  it('Handles errors within an array', async () => {
    const SAMPLE5 = join(__dirname, 'fixtures', 'sample5.yaml');
    const editor = await atom.workspace.open(SAMPLE5);
    const messages = await lint(editor);

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: 'Additional properties not allowed: descriptio',
      location: {
        file: SAMPLE5,
        position: [[8, 4], [8, 14]],
      },
    });
  });

  it('Handles nested properties with the same name', async () => {
    const SAMPLE6 = join(__dirname, 'fixtures', 'sample6.yaml');
    const editor = await atom.workspace.open(SAMPLE6);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      severity: 'error',
      excerpt: 'No enum match for: strin',
      location: {
        file: SAMPLE6,
        position: [[17, 18], [17, 22]],
      },
    });
  });
});
