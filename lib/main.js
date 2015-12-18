'use babel'

import Path from 'path';
import SwaggerParser from 'swagger-parser';

function isSwaggerFile(path) {
  return /swagger\.(yaml|json)$/i.test(path);
}

export default {
  activate() {
    this.scopes = ['source.json', 'source.yaml']
  },
  deactivate() {
  },
  provideLinter() {
    const provider = {
      name: "SwaggerParser",
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint (editor) {
        let text = editor.getText();
        let path = editor.getPath();
        if (text.length < 1
          || !isSwaggerFile(path)) {
          return Promise.resolve([])
        }
        return new Promise((resolve) => {
          SwaggerParser.validate(path, {
            validate: {
              spec: true
            }
          })
            .then((api) => {
              resolve([]);
            })
            .catch((err) => {
              var errObj = err.toJSON();
              resolve([{
                type: "Error",
                text: errObj.message,
                filePath: path
              }]);
            });
        });
      }
    }
    return provider;
  }

}
