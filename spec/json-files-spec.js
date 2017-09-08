'use babel';

// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';
import { join } from 'path';
import { provideLinter } from '../lib/main';

const { lint } = provideLinter();

describe('Linting JSON files', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-json');
    await atom.packages.activatePackage('linter-swagger');
  });

  it('Handles correct input with no errors', async () => {
    const PETSTORE = join(__dirname, 'fixtures', 'petstore.json');
    const editor = await atom.workspace.open(PETSTORE);
    const messages = await lint(editor);

    expect(messages.length).toEqual(0);
  });

  it('Handles invalid type errors', async () => {
    const SAMPLE1 = join(__dirname, 'fixtures', 'sample1.json');
    const editor = await atom.workspace.open(SAMPLE1);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      type: 'Error',
      text: 'No enum match for: strin',
      filePath: SAMPLE1,
      range: [[19, 40], [19, 46]],
    });
    expect(messages[1]).toEqual({
      type: 'Error',
      text: 'Expected type array but found type string',
      filePath: SAMPLE1,
      range: [[19, 40], [19, 46]],
    });
  });

  it('Handles additional property errors', async () => {
    const SAMPLE2 = join(__dirname, 'fixtures', 'sample2.json');

    const editor = await atom.workspace.open(SAMPLE2);
    const messages = await lint(editor);

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      type: 'Error',
      text: 'Additional properties not allowed: forma',
      filePath: SAMPLE2,
      range: [[20, 40], [20, 47]],
    });
  });

  it("Rejects unsupported 'anyOf' directive", async () => {
    const SAMPLE3 = join(__dirname, 'fixtures', 'sample3.json');
    const editor = await atom.workspace.open(SAMPLE3);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      type: 'Error',
      text: 'Additional properties not allowed: anyOf',
      filePath: SAMPLE3,
      range: [[13, 28], [13, 35]],
    });
    expect(messages[1]).toEqual({
      type: 'Error',
      text: 'Missing required property: type',
      filePath: SAMPLE3,
      range: [[13, 28], [13, 35]],
    });
  });

  it('Handles bad reference errors', async () => {
    const SAMPLE4 = join(__dirname, 'fixtures', 'sample4.json');

    const editor = await atom.workspace.open(SAMPLE4);
    const messages = await lint(editor);

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      type: 'Error',
      text: `Error resolving $ref pointer "${SAMPLE4}#/definitions/INVALIDREFERENCE". \nToken "definitions" does not exist.`,
      filePath: SAMPLE4,
      range: undefined,
    });
  });

  it('Handles errors within an array', async () => {
    const SAMPLE5 = join(__dirname, 'fixtures', 'sample5.json');

    const editor = await atom.workspace.open(SAMPLE5);
    const messages = await lint(editor);

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      type: 'Error',
      text: 'Additional properties not allowed: descriptio',
      filePath: SAMPLE5,
      range: [[13, 6], [13, 18]],
    });
  });

  it('Handles nested properties with the same name', async () => {
    const SAMPLE6 = join(__dirname, 'fixtures', 'sample6.json');
    const editor = await atom.workspace.open(SAMPLE6);
    const messages = await lint(editor);

    expect(messages.length).toEqual(2);
    expect(messages[0]).toEqual({
      type: 'Error',
      text: 'No enum match for: strin',
      filePath: SAMPLE6,
      range: [[19, 20], [19, 26]],
    });
  });
});
