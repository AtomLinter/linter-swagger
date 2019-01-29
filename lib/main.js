'use babel';

// Dependencies
let SwaggerParser;
let parseSwaggerErrors;
let populateRangesForErrors;

// Internal variables
const idleCallbacks = new Set();

function canValidate(text) {
  return text.length > 8 && /"?(swagger|openapi)"?\s*:\s*['"]\d+\.\d+(.\d+)?['"]/g.test(text);
}

function errorsToLinterMessages(err, path, text) {
  const errors = parseSwaggerErrors(err);
  populateRangesForErrors(errors, text);

  return errors.map(error => ({
    severity: 'error',
    excerpt: error.message,
    location: {
      file: path,
      position: error.range,
    },
  }));
}

function loadDependencies() {
  if (!SwaggerParser) {
    SwaggerParser = require('swagger-parser');
  }
  if (!parseSwaggerErrors) {
    parseSwaggerErrors = require('./error-util');
  }
  if (!populateRangesForErrors) {
    populateRangesForErrors = require('./range-util');
  }
}

export default {
  canValidate,
  activate() {
    let depsCallbackID;
    const linterSwaggerDeps = () => {
      idleCallbacks.delete(depsCallbackID);
      // Load package dependencies
      require('atom-package-deps').install('linter-swagger');
      // Initialize dependencies
      loadDependencies();
    };
    depsCallbackID = window.requestIdleCallback(linterSwaggerDeps);
    idleCallbacks.add(depsCallbackID);
  },

  deactivate() {
    idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    idleCallbacks.clear();
  },

  provideLinter() {
    return {
      name: 'SwaggerParser',
      grammarScopes: ['source.json', 'source.yaml'],
      scope: 'file',
      lintsOnChange: true,
      lint: async (editor) => {
        const path = editor.getPath();
        const text = editor.getText();
        if (!canValidate(text)) {
          return [];
        }

        loadDependencies();

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
      },
    };
  },
};
