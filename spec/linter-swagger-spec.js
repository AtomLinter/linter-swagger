'use babel';

import * as path from 'path';

describe('The Swagger provider for Linter', () => {
  const lint = require(path.join('..', 'lib', 'main.js')).provideLinter().lint;

  describe('linting JSON files', () => {

    beforeEach(() => {
      atom.workspace.destroyActivePaneItem();
      waitsForPromise(() => {
        atom.packages.activatePackage('linter-swagger');
        return atom.packages.activatePackage('language-json').then(() =>
          atom.workspace.open(path.join(__dirname, 'fixtures', 'petstore.json'))
        );
      });
    });

    it('finds nothing wrong with valid file', () => {
      waitsForPromise(() => {
        const goodFile = path.join(__dirname, 'fixtures', 'petstore.json');
        return atom.workspace.open(goodFile).then(editor => {
          return lint(editor).then(messages => {
            expect(messages.length).toEqual(0);
          });
        });
      });
    });

  });

  describe('linting YAML files', () => {

    beforeEach(() => {
      atom.workspace.destroyActivePaneItem();
      waitsForPromise(() => {
        atom.packages.activatePackage('linter-swagger');
        return atom.packages.activatePackage('language-yaml').then(() =>
          atom.workspace.open(path.join(__dirname, 'fixtures', 'petstore.yaml'))
        );
      });
    });

    describe('checks a file with issues', () => {
      let editor = null;
      const badFile = path.join(__dirname, 'fixtures', 'petstore-badref.yaml');

      beforeEach(() => {
        waitsForPromise(() => {
          return atom.workspace.open(badFile).then(openEditor => {
            editor = openEditor;
          });
        });
      });

      it('finds at least one message', () => {
        waitsForPromise(() => {
          return lint(editor).then(messages => {
            expect(messages.length).toBeGreaterThan(0);
          });
        });
      });

      it('verifies the message', () => {
        waitsForPromise(() => {
          return lint(editor).then(messages => {
            console.log(JSON.stringify(messages));
            expect(messages[0].type).toBeDefined();
            expect(messages[0].type).toEqual('Error');
            expect(messages[0].text).toBeDefined();
            expect(messages[0].filePath).toBeDefined();
            expect(messages[0].filePath).toMatch(/.+petstore\-badref\.yaml$/);
          });
        });
      });
    });

    it('finds nothing wrong with valid file', () => {
      waitsForPromise(() => {
        const goodFile = path.join(__dirname, 'fixtures', 'petstore.yaml');
        return atom.workspace.open(goodFile).then(editor => {
          return lint(editor).then(messages => {
            expect(messages.length).toEqual(0);
          });
        });
      });
    });

  });


});
