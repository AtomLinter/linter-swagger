'use babel'

import SwaggerParser from 'swagger-parser';

function canValidate(path, text) {
  return text.length > 8 &&
    /"?swagger"?\s*:\s*"\d+\.\d+"/g.test(text);
}

function errorsToLinterMessages(err, path, editor) {
  var errObj = err.toJSON();
  if (!errObj.details) {
    return Promise.resolve([{
      type: "Error",
      text: errObj.message,
      filePath: path
    }]);
  }
  return Promise.all(errObj.details.map((detail) => {
    return new Promise((resolve) => {
      var re = new RegExp(`"?${detail.path[0]}"?:`);
      editor.scan(re, (search) => {
        let rng = search.range;
        resolve({
          type: "Error",
          text: detail.message,
          filePath: path,
          range: [
            [rng.start.row, rng.start.column],
            [rng.end.row], [rng.end.column]
          ]
        });
      });
    });
  }));
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
        errorsToLinterMessages(err, path, editor)
          .then(resolve);
      });
  });
}
