'use babel'

import { tryValidate } from './validator';
import { install } from 'atom-package-deps';

export default {
  activate() {
    this.scopes = ['source.json', 'source.yaml'];
    install('linter-swagger');
  },
  deactivate() {
  },
  provideLinter() {
    const provider = {
      name: "SwaggerParser",
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: tryValidate
    }
    return provider;
  }

}
