# language-godata [<img src="https://avatars2.githubusercontent.com/u/9555108?s=200&v=4)" alt="alt text" height="20">](https://www.openfn.org) [![Build Status](https://travis-ci.org/OpenFn/language-godata.svg?branch=master)](https://travis-ci.org/OpenFn/language-godata)

<img src="https://github.com/OpenFn/language-godata/raw/master/logo.png" alt="alt text" height="50">

An OpenFn **_adaptor_** for building integration jobs for use with the WHO Go.Data
API.

[Go.Data](https://www.who.int/godata) is an outbreak investigation tool for field data collection during public health emergencies. The tool includes functionality for case investigation, contact follow-up, visualization of chains of transmission including secure data exchange and is designed for flexibility in the field, to adapt to the wide range of outbreak scenarios. 

## Documentation

- View the documentation at https://openfn.github.io/language-godata/
- To update the documentation site, run: `./node_modules/.bin/jsdoc --readme ./README.md ./lib -d docs`

## Helper Functions
### post(...)

#### sample configuration

```json
{
  "username": "taylor@openfn.org",
  "password": "supersecret"
}
```

#### sample expression using operation

```js
post({
  "url": "api/v1/forms/data/wide/json/formId",
  "body": {"a":1}
  "headers": {}
})
```

### createContact(...)
#### sample expression using operation
_Example to consider for development_
```js
createContact({
  "url": "api/outbreaks/{id}/contacts",
  "body": {"outbreak": "id", "firstname": "aleksa", ...}
  "headers": {}
})
```
## Development

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
