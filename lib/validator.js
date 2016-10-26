'use babel';

import SwaggerParser from 'swagger-parser';
import _, { flatten } from 'lodash';

function tokenizedLineForRow(editor, lineNumber) {
  return editor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(lineNumber);
}

function checkTokenScope(scopes) {
  return scopes.indexOf('entity.name.tag.yaml') >= 0 ||
    scopes.indexOf('meta.structure.dictionary.json') >= 0;
}

function extractRange(givenPath, editor) {
  let lineNumber = 0;
  let pathIndex = 0;
  let foundRange;
  const maxLine = editor.getLineCount();
  // remove numeric indexes
  const path = givenPath.filter(str => isNaN(str));

  const checkLineTokens = (tokens) => {
    let offset = 0;
    tokens.forEach((token) => {
      if (checkTokenScope(token.scopes) &&
          token.value === path[pathIndex]) {
        pathIndex += 1;
        if (pathIndex >= path.length) {
          foundRange = [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
          return;
        }
      }
      offset += token.bufferDelta;
    });
  };

  while (lineNumber <= maxLine) {
    const tokenizedLine = tokenizedLineForRow(editor, lineNumber);
    if (typeof tokenizedLine === 'undefined') {
      break;
    }
    checkLineTokens(tokenizedLine.tokens);
    if (foundRange) {
      return foundRange;
    }
    lineNumber += 1;
  }

  // Unable to determine the range for some reason
  return null;
}

function canValidate(path, text) {
  return text.length > 8 &&
    /"?swagger"?\s*:\s*['"]\d+\.\d+['"]/g.test(text);
}

function errorsToLinterMessages(err, path, editor) {
  const errObj = err.toJSON();
  if (!errObj.details) {
    return Promise.resolve([{
      type: 'Error',
      text: errObj.message,
      filePath: path,
    }]);
  }
  return Promise.all(errObj.details.map((detail) => {
    if (detail.code === 'ONE_OF_MISSING' && detail.inner) {
      const errors = _(detail.inner).map(innerDetail => (
        {
          type: 'Error',
          text: innerDetail.message,
          filePath: path,
          range: extractRange(innerDetail.path, editor),
        }
      )).valueOf();
      return Promise.resolve(errors);
    }
    return Promise.resolve({
      type: 'Error',
      text: detail.message,
      filePath: path,
      range: extractRange(detail.path, editor),
    });
  }));
}

export default function tryValidate(editor) {
  const path = editor.getPath();
  const text = editor.getText();
  if (!canValidate(path, text)) {
    return Promise.resolve([]);
  }
  return new Promise((resolve) => {
    SwaggerParser.validate(path, {
      validate: {
        spec: true,
      },
    })
      .then(() => {
        resolve([]);
      })
      .catch((err) => {
        errorsToLinterMessages(err, path, editor)
          .then((arg) => {
            const linterMessages = flatten(arg).valueOf();
            resolve(linterMessages);
          });
      });
  });
}
