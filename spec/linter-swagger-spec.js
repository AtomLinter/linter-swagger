'use babel';

import { join } from 'path';
import { provideLinter } from '../lib/main';

const lint = provideLinter().lint;

const petstoreJSONPath = join(__dirname, 'fixtures', 'petstore.json');
const petstoreYAMLPath = join(__dirname, 'fixtures', 'petstore.yaml');
const petstoreBadref = join(__dirname, 'fixtures', 'petstore-badref.yaml');

describe('The Swagger provider for Linter', () => {
  describe('linting JSON files', () => {
    beforeEach(() => {
      atom.workspace.destroyActivePaneItem();
      waitsForPromise(() =>
        Promise.all([
          atom.packages.activatePackage('linter-swagger'),
          atom.packages.activatePackage('language-json'),
        ])
      );
    });

    it('finds nothing wrong with valid file', () => {
      waitsForPromise(() =>
        atom.workspace.open(petstoreJSONPath).then(editor =>
          lint(editor).then(messages =>
            expect(messages.length).toBe(0)
          )
        )
      );
    });
  });

  describe('linting YAML files', () => {
    beforeEach(() => {
      atom.workspace.destroyActivePaneItem();
      waitsForPromise(() =>
        Promise.all([
          atom.packages.activatePackage('linter-swagger'),
          atom.packages.activatePackage('language-yaml'),
        ])
      );
    });

    describe('checks a file with issues', () => {
      let editor = null;

      beforeEach(() => {
        waitsForPromise(() =>
          atom.workspace.open(petstoreBadref).then((openEditor) => {
            editor = openEditor;
          })
        );
      });

      it('finds one message', () =>
        waitsForPromise(() =>
          lint(editor).then(messages =>
            expect(messages.length).toBe(1)
          )
        )
      );

      it('verifies the message', () => {
        /* eslint-disable no-useless-escape */
        const msgRegex = new RegExp('Error resolving \\$ref pointer ".+' +
          '#\/definitions\/INVALIDREFERENCE"\\.\\s+' +
          'Token "definitions" does not exist\\.', 'g');
        /* eslint-enable no-useless-escape */
        return waitsForPromise(() =>
          lint(editor).then((messages) => {
            expect(messages[0].type).toBe('Error');
            expect(messages[0].text).toMatch(msgRegex);
            expect(messages[0].filePath).toBe(petstoreBadref);
            expect(messages[0].range).toEqual([[0, 0], [0, 14]]);
          })
        );
      });
    });

    it('finds nothing wrong with a valid file', () =>
      waitsForPromise(() =>
        atom.workspace.open(petstoreYAMLPath).then(editor =>
          lint(editor).then((messages) => {
            expect(messages.length).toBe(0);
          })
        )
      )
    );
  });
});
