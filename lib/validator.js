'use babel'

import SwaggerParser from 'swagger-parser';
import _, { flatten } from 'lodash';
import { rangeFromLineNumber } from 'atom-linter';

function tokenizedLineForRow(editor, lineNumber) {
  return editor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(lineNumber);
}

function checkTokenScope(scopes) {
  return scopes.indexOf("entity.name.tag.yaml") >= 0 ||
    scopes.indexOf("meta.structure.dictionary.json") >= 0;
}

function extractRange(path, editor) {
  let lineNumber = 0,
      pathIndex = 0,
      foundRange;
  // remove numeric indexes
  var path = path.filter((str) => isNaN(str));
  while (true) {
    let tokenizedLine = tokenizedLineForRow(editor, lineNumber);
    if (typeof tokenizedLine === "undefined") {
      break;
    }
    tokenizedLine.tokens.forEach((token) => {
      if (checkTokenScope(token.scopes) &&
          token.value === path[pathIndex]) {
        pathIndex++;
        if (pathIndex >= path.length) {
          foundRange = rangeFromLineNumber(editor, lineNumber);
          return;
        }
      }
    });
    if (foundRange) {
      return foundRange;
    }
    lineNumber++;
  }
}

function canValidate(path, text) {
  return text.length > 8 &&
    /"?swagger"?\s*:\s*['"]\d+\.\d+['"]/g.test(text);
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
    if (detail.code === "ONE_OF_MISSING" && detail.inner) {
      let errors = _(detail.inner).map((innerDetail) => {
        return {
          type: "Error",
          text: innerDetail.message,
          filePath: path,
          range: extractRange(innerDetail.path, editor)
        };
      }).valueOf();
      return Promise.resolve(errors);
    }
    return Promise.resolve({
      type: "Error",
      text: detail.message,
      filePath: path,
      range: extractRange(detail.path, editor)
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
          .then(function(arg) {
            let linterMessages = flatten(arg).valueOf();
            resolve(linterMessages);
          });
      });
  });
}
