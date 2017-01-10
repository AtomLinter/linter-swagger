'use babel';

import SwaggerParser from 'swagger-parser';
import parseSwaggerErrors from './error-util';
import populateRangesForErrors from './range-util';


function canValidate(text) {
  return text.length > 8 && /"?swagger"?\s*:\s*['"]\d+\.\d+['"]/g.test(text);
}

function errorsToLinterMessages(err, path, text) {
  const errors = parseSwaggerErrors(err);
  populateRangesForErrors(errors, text);

  return errors.map(error => ({
    type: 'Error',
    text: error.message,
    filePath: path,
    range: error.range,
  }));
}


export default async function tryValidate(editor) {
  const path = editor.getPath();
  const text = editor.getText();
  if (!canValidate(text)) {
    return [];
  }

  try {
    await SwaggerParser.validate(path, { validate: { spec: true } });
    return [];
  } catch (err) {
    if (editor.getText() !== text) {
     // Editor contents have changed, tell Linter not to update messages
      return null;
    }

    const linterMessages = errorsToLinterMessages(err, path, text);
    return linterMessages;
  }
}
