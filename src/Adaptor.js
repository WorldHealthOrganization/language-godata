/** @module Adaptor */
import {
  execute as commonExecute,
  composeNextState,
  expandReferences,
} from 'language-common';
import axios from 'axios';
import { resolve } from 'path';

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state => {
    return commonExecute(
      login,
      ...operations,
      /* logout */
    )({ ...initialState, ...state }).catch(e => {
      console.error(e);
      /* logout(); */
      process.exit(1);
    });
  };
}

function login(state) {
  const { host, password, email } = state.configuration;

  return axios({
    method: 'post',
    url: `${host}/users/login`,
    data: {
      email,
      password,
    },
  }).then(response => {
    console.log('Authentication succeeded.');
    const { id } = response.data;
    return { ...state, configuration: { host, id } };
  });
}

function logout(state) {
  const { host, id } = state.configuration;
  return axios({
    method: 'post',
    url: `${host}users/logout?access_token=${id}`,
  }).then(() => {
    console.log('logged out');
    delete state.configuration;
    return state;
  });
}

// Note that we expose the entire axios package to the user here.
exports.axios = axios;

// What functions do you want from the common adaptor?
export {
  alterState,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  lastReferenceValue,
  merge,
  sourceValue,
} from 'language-common';
