'use babel';

import * as path from 'path';
import { provideLinter } from '../lib/main';

const lint = provideLinter().lint;

const petstoreJSONPath = path.join(__dirname, 'fixtures', 'petstore.json');
const petstoreYAMLPath = path.join(__dirname, 'fixtures', 'petstore.yaml');
const petstoreBadref = path.join(__dirname, 'fixtures', 'petstore-badref.yaml');

describe('The Swagger provider for Linter', () => {
  describe('linting JSON files', () => {
    beforeEach(() => {
      atom.workspace.destroyActivePaneItem();
      waitsForPromise(() =>
        Promise.all([
          atom.packages.activatePackage('linter-swagger'),
          atom.packages.activatePackage('language-json'),
        ]).then(() =>
          atom.workspace.open(petstoreJSONPath)
        )
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
        ]).then(() =>
          atom.workspace.open(petstoreYAMLPath)
        )
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

      it('finds at least one message', () =>
        waitsForPromise(() =>
          lint(editor).then(messages =>
            expect(messages.length).toBeGreaterThan(0)
          )
        )
      );

      it('verifies the message', () =>
        waitsForPromise(() =>
          lint(editor).then((messages) => {
            expect(messages[0].type).toBe('Error');
            expect(messages[0].text).toBeDefined();
            expect(messages[0].filePath).toBe(petstoreBadref);
          })
        )
      );
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
