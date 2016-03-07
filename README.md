# linter-swagger

## Synopsis

This plugin is a plugin for an [Atom](https://atom.io/) text editor plugin called [Linter](https://github.com/AtomLinter/Linter). Linter is used to lint various text formats in Atom and linter-swagger will specifically lint [Swagger specification](http://swagger.io/specification/) files. linter-swagger will validate Swagger files in both JOSN and YAML formats.

## Motivation

Swagger is gaining ground as a standard to write YAML or JSON based API specifications. To validate the YAML or JSON files one could use [various tools](http://swagger.io/swagger-editor/) to edit and validate the text file against the Swagger specification. Atom is a great tool to do YAML or JSON editing in and by using linter-swagger you can validate and write the Swagger specifications all form one application. 

## Installation

This plugin, linter-swagger, can be enabled via the Atom GUI or command line. Please see this [link to enabling packages in Atom] (https://atom.io/docs/latest/using-atom-atom-packages). 

To enable the linter-swagger plugin you will have install the Linter plugin (which is a prequisite to using linter-swagger in Atom) and addiotionally you will need to install the linter-sawgger plugin.

## Usage

Once the linter-swagger is enabled in Atom you can have linter-swagger validate your files as you type, this can be configured to be done on '''save only''' or ''''whilst you type'''. 

linter-swagger will know which files to validate based on the swagger version line (normally) at the top in the Swagger file. linter-swagger will lint either JSON or YAML files. 

When using the linter-swagger plugin '''Please note:''' that you need to place the Swagger version number (for swagger version 2 this is a '''2''' as in swagger: "2") in double qoutes so that linter-swagger will know which JSON or YAML files to start validating. Ex.

swagger: "2"

and '''NOT''' 

swagger: '2' 

## Contributors

linter-swagger and Atom are great tools and it will be great if you can help in making linter-swagger better. If you can contribute please let us know.

## License

"Seems like a BSD license"

