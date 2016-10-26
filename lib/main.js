'use babel';

import { install } from 'atom-package-deps';
import tryValidate from './validator';

export default {
  activate() {
    this.scopes = ['source.json', 'source.yaml'];
    install('linter-swagger');
  },

  deactivate() {
  },

  provideLinter() {
    return {
      name: 'SwaggerParser',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: tryValidate,
    };
  },
};
