'use babel'

import SwaggerParser from 'swagger-parser';

function canValidate(path, text) {
  return text.length > 8 &&
    /"?swagger"?\s*:\s*"\d+\.\d+"/g.test(text);
}

function errorToLinterMessage(err, path) {
  var errObj = err.toJSON();
  return {
    type: "Error",
    text: errObj.message,
    filePath: path
  };
}

export function tryValidate(editor) {
  let path = editor.getPath();
  let text = editor.getText();
  if (!canValidate(path, text)) {
    return Promise.resolve([]);
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
        resolve([errorToLinterMessage(err, path)]);
      });
  });
}
