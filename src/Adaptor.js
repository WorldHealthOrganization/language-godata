/** @module Adaptor */
import {
  execute as commonExecute,
  composeNextState,
  expandReferences,
} from 'language-common';
import axios from 'axios';

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
      ...operations
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
    url: `${host}/users/logout?access_token=${id}`,
  }).then(() => {
    console.log('logged out');
    delete state.configuration;
    return state;
  });
}

/**
 * Fetch the list of contacts
 * @public
 * @example
 *  listContact({}, function (state) {
 *    console.log(state);
 *    return state;
 *  });
 * @function
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function listContact(params, callback) {
  return state => {
    const { host, id } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    return axios({
      method: 'GET',
      url: `${host}/users?access_token=${id}`,
    })
      .then(response => {
        const nextState = composeNextState(state, response);
        if (callback) return callback(nextState);
        return nextState;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
  };
}

/**
 * Fetch the list of outbreaks
 * @public
 * @example
 *  listOutbreaks({}, state => {
 *    console.log(state.data);
 *    return state;
 *  });
 * @function
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function listOutbreaks(params, callback) {
  return state => {
    const { host, id } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    return axios({
      method: 'GET',
      url: `${host}/outbreaks?access_token=${id}`,
    })
      .then(response => {
        const nextState = composeNextState(state, response.data);
        if (callback) return callback(nextState);
        return nextState;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
  };
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
