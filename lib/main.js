'use babel'

import { tryValidate } from './validator';

export default {
  activate() {
    this.scopes = ['source.json', 'source.yaml'];
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
