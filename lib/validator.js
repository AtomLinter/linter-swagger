'use babel'

import SwaggerParser from 'swagger-parser';

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
  while (true) {
    let offset = 0;
    let tokenizedLine = tokenizedLineForRow(editor, lineNumber);
    if (typeof tokenizedLine === "undefined") {
      break;
    }
    tokenizedLine.tokens.forEach((token) => {
      if (checkTokenScope(token.scopes) &&
          token.value === path[pathIndex]) {
        pathIndex++;
        if (pathIndex >= path.length) {
          foundRange = [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]]
          return;
        }
      }
      offset += token.bufferDelta;
    });
    if (foundRange) {
      return foundRange;
    }
    lineNumber++;
  }
}

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
    var range = extractRange(detail.path, editor);
    return Promise.resolve({
      type: "Error",
      text: detail.message,
      filePath: path,
      range
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
