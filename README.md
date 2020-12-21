# language-godata [<img src="https://avatars2.githubusercontent.com/u/9555108?s=200&v=4)" alt="alt text" height="20">](https://www.openfn.org) [![Build Status](https://travis-ci.org/OpenFn/language-godata.svg?branch=master)](https://travis-ci.org/OpenFn/language-godata)

<img src="https://github.com/OpenFn/language-godata/raw/master/logo.png" alt="alt text" height="50">

An OpenFn **_adaptor_** for building integration jobs for use with the WHO Go.Data
API.

[Go.Data](https://www.who.int/godata) is an outbreak investigation tool for
field data collection during public health emergencies. The tool includes
functionality for case investigation, contact follow-up, visualization of chains
of transmission including secure data exchange and is designed for flexibility
in the field, to adapt to the wide range of outbreak scenarios.

## Documentation

- View the documentation at https://openfn.github.io/language-godata/
- To update the documentation site, run: `./node_modules/.bin/jsdoc --readme ./README.md ./lib -d docs`

## Helper Functions

### post(...)

#### sample configuration

```json
{
  "email": "mamadou@openfn.org",
  "password": "supersecret",
  "apiUrl": "https://www.who-godata.com/api"
}
```

## Fetch the list of outbreaks

This function is used to fetch the whole list of outbreaks in Go.Data.

```js
listOutbreaks({}, state => {
  console.log(state.data);
  return state;
});
```

## Get a specific outbreak

This function can be used to fetch one specific outbreak. A filtering mechanism is used to specify a criteria to match.

```js
getOutbreak({ where: { name: 'Outbreak demo' } }, {}, state => {
  console.log(state.data);
  return state;
});
```

## Insert or Update an outbreak using a unique id as a key

This function is used to either update a record in Go.Data if matched or insert a new one if no record matched the unique id.

```js
upsertOutbreak({
  externalId: '3dec33-ede3',
  data: {
    name: 'string',
    description: 'string',
    disease: 'string',
    countries: [
      {
        id: 'SENEGAL',
      },
    ],
    startDate: '2020-12-17T14:54:19.498Z',
    endDate: '2020-12-17T14:54:19.498Z',
    longPeriodsBetweenCaseOnset: 0,
    periodOfFollowup: 0,
  },
});
```

## Fetch the list of cases

This function is used to fetch the whole list of cases for a specific outbreak in Go.Data.

```js
listCases('4c444f7-4e11-41d0-c1af-331dd15a892e', {}, state => {
  console.log(state);
  return state;
});
```

## Get a specific case

This function can be used to fetch one specific case for an outbreak. A filtering mechanism can specify a criteria to match.

```js
getCase(
  '4c444f7-4e11-41d0-c1af-331dd15a892e',
  { 'where.relationship': { active: true }, where: { firstName: 'Luca' } },
  {},
  state => {
    console.log(state);
    return state;
  }
);
```

## Insert or Update a case using a unique id as a key

This function is used to either update a case in Go.Data if matched or insert a new one if no record matched the unique id.

```js
upsertCase('4dce-3eedce3-rd33', 'visualId', {
  data: state => {
    const patient = state.data.body;
    return {
      firstName: patient.Patient_name.split(' ')[0],
      lastName: patient.Patient_name.split(' ')[1],
      visualId: patient.Case_ID,
      'age:years': patient.Age_in_year,
      gender: patient.Sex,
    };
  },
});
```

## Fetch the list of contacts

This function is used to fetch the whole list of contacts for a specific outbreak in Go.Data.

```js
listContacts('4c444f7-4e11-41d0-c1af-331dd15a892e', {}, state => {
  console.log(state);
  return state;
});
```

## Get a specific contact

This function can be used to get one specific contact for an outbreak. A filtering mechanism can specify a criteria to match.

```js
getContact('343d-dc3e', { where: { firstName: 'Luca' } }, {}, state => {
  console.log(state.data);
  return state;
});
```

## Insert or Update a contact using a unique id as a key

This function is used to either update a contact in Go.Data if matched or insert a new one if no record matched the unique id.

```js
upsertContact('4dce-3eedce3-rd33', 'visualId', {
  data: {
    firstName: 'Luca',
    gender: 'male',
    'age:years': '20',
  },
});
```

## Fetch the list of locations

This function is used to fetch the list of locations.

```js
listLocations({}, state => {
  console.log(state);
  return state;
});
```

## Get a specific location

This function can be used to get one specific location. A filtering mechanism can specify a criteria to match.

```js
getLocation({ where: { name: '30 DE MAYO' } }, {}, state => {
  console.log(state.data);
  return state;
});
```

## Insert or Update a location using a unique id as a key

This function is used to either update a location if matched or insert a new. A custom `externalId` can be provided.

```js
upsertLocation('name', {
  data: {
    name: '30 DE DECIEMBRE',
    synonyms: [],
    identifiers: [],
    active: true,
    populationDensity: 0,
    geoLocation: {
      lat: -45.343244,
      lng: -67.193873,
    },
  },
});
```

## Development

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
