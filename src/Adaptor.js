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
  const { apiUrl, password, email } = state.configuration;

  return axios({
    method: 'post',
    url: `${apiUrl}/users/login`,
    data: {
      email,
      password,
    },
  }).then(response => {
    console.log('Authentication succeeded.');
    const { id } = response.data;
    return { ...state, configuration: { apiUrl, access_token: id } };
  });
}

function logout(state) {
  const { apiUrl, access_token } = state.configuration;
  return axios({
    method: 'post',
    url: `${apiUrl}/users/logout?access_token=${access_token}`,
  }).then(() => {
    console.log('logged out');
    delete state.configuration;
    return state;
  });
}

/**
 * Fetch the list of contacts within a particular outbreak using its ID.
 * @public
 * @example
 *  listContacts("343d-dc3e", {}, state => {
 *    console.log(state);
 *    return state;
 *  });
 * @function
 * @param {string} id - Outbreak id
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function listContacts(id, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    return axios({
      method: 'GET',
      baseURL: apiUrl,
      url: `/outbreaks/${id}/contacts`,
      params: {
        access_token,
      },
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

/**
 * Get a specific contact within an outbreak from a query filter
 * @public
 * @example
 *  getContact("343d-dc3e", {"where":{"firstName": "Luca"}}, {}, state => {
 *    console.log(state.data);
 *    return state;
 *  });
 * @function
 * @param {string} id - Outbreak id
 * @param {object} query - An object with a query filter parameter
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function getContact(id, query, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    const filter = JSON.stringify(query);

    return axios({
      baseURL: apiUrl,
      url: `/outbreaks/${id}/contacts`,
      method: 'GET',
      params: {
        filter,
        access_token,
      },
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

/**
 * Upsert contact to godata
 * @public
 * @example
 *  upsertContact("4dce-3eedce3-rd33", 'visualId', { data: {...}})
 * @function
 * @param {string} id - Outbreak id
 * @param {string} externalId - External Id to match
 * @param {object} params - an object with an externalId and some case data.
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function upsertContact(id, externalId, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { data, headers, body, options, ...rest } = expandReferences(params)(
      state
    );

    const query = { where: {} };
    query.where[externalId] = data[externalId];

    const filter = JSON.stringify(query);

    return axios({
      baseURL: apiUrl,
      url: `/outbreaks/${id}/contacts`,
      method: 'GET',
      params: {
        filter,
        access_token,
      },
    })
      .then(response => {
        if (response.data.length > 1) {
          console.log('Multiple contacts found. Aborting upsert.');
          console.log(response.data.length, 'contacts');
        } else if (response.data.length === 1) {
          console.log('Contact found. Performing update.');
          const contactId = response.data[0].id;
          return axios({
            method: 'PUT',
            baseURL: apiUrl,
            url: `/outbreaks/${id}/contacts/${contactId}`,
            params: {
              access_token,
            },
            data,
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
        } else {
          console.log('No contact found. Performing create.');
          return axios({
            method: 'POST',
            baseURL: apiUrl,
            url: `/outbreaks/${id}/contacts/`,
            params: {
              access_token,
            },
            data,
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
        }
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
    const { apiUrl, access_token } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    return axios({
      method: 'GET',
      baseURL: apiUrl,
      url: '/outbreaks',
      params: {
        access_token,
      },
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

/**
 * Get a specific outbreak from a query filter
 * @public
 * @example
 *  getOutbreak({"where":{"name": "Outbreak demo"}}, {}, state => {
 *    console.log(state.data);
 *    return state;
 *  });
 * @function
 * @param {object} query - An object with a query filter parameter
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function getOutbreak(query, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    const filter = JSON.stringify(query);

    return axios({
      method: 'GET',
      baseURL: apiUrl,
      url: '/outbreaks',
      params: {
        filter,
        access_token,
      },
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

/**
 * Upsert outbreak to godata
 * @public
 * @example
 *  upsertOutbreak({externalId: "outbreak_id", data: {...}})
 * @function
 * @param {object} params - an object with an externalId and some case data.
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function upsertOutbreak(params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const {
      externalId,
      data,
      headers,
      body,
      options,
      ...rest
    } = expandReferences(params)(state);

    const filter = JSON.stringify({ where: { id: externalId } });

    return axios({
      method: 'GET',
      baseURL: apiUrl,
      url: '/outbreaks',
      params: {
        filter,
        access_token,
      },
    })
      .then(response => {
        if (response.data.length > 0) {
          console.log('Outbreak found. Performing update.');
          const outbreakId = response.data[0].id;
          return axios({
            method: 'PUT',
            url: `/outbreaks/${outbreakId}`,
            params: {
              access_token,
            },
            data,
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
        } else {
          console.log('No outbreak found. Performing create.');
          return axios({
            method: 'POST',
            baseURL: apiUrl,
            url: '/outbreaks',
            params: {
              access_token,
            },
            data,
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
        }
      })
      .catch(error => {
        console.log(error);
        return error;
      });
  };
}

/**
 * Fetch the list of cases within a particular outbreak using its ID.
 * @public
 * @example
 *  listCases("343d-dc3e", {}, state => {
 *    console.log(state);
 *    return state;
 *  });
 * @function
 * @param {string} id - Outbreak id
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function listCases(id, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    return axios({
      method: 'GET',
      baseURL: apiUrl,
      url: `/outbreaks/${id}/cases`,
      params: {
        access_token,
      },
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

/**
 * Get a specific case within an outbreak from a query filter
 * @public
 * @example
 * getCase(
 *    '3b55-cdf4',
 *    { 'where.relationship': { active: true }, where: { firstName: 'Luca'} },
 *    {},
 *    state => {
 *      console.log(state);
 *      return state;
 *    }
 * );

 * @function
 * @param {string} id - Outbreak id
 * @param {object} query - An object with a query filter parameter
 * @param {object} params - Options, Headers parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function getCase(id, query, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { headers, body, options, ...rest } = expandReferences(params)(state);

    const filter = JSON.stringify(query);

    return axios({
      baseURL: apiUrl,
      url: `/outbreaks/${id}/cases`,
      method: 'GET',
      params: {
        filter,
        access_token,
      },
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

/**
 * Upsert case to godata
 * @public
 * @example
 *  upsertCase("4dce-3eedce3-rd33", 'visualId', { data: {...}})
 * @function
 * @param {string} id - Outbreak id
 * @param {string} externalId - External Id to match
 * @param {object} params - an object with an externalId and some case data.
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function upsertCase(id, externalId, params, callback) {
  return state => {
    const { apiUrl, access_token } = state.configuration;

    const { data, headers, body, options, ...rest } = expandReferences(params)(
      state
    );

    const query = { where: {} };
    query.where[externalId] = data[externalId];

    const filter = JSON.stringify(query);

    return axios({
      baseURL: apiUrl,
      url: `/outbreaks/${id}/cases`,
      method: 'GET',
      params: {
        filter,
        access_token,
      },
    })
      .then(response => {
        if (response.data.length > 1) {
          console.log('Multiple cases found. Aborting upsert.');
          console.log(response.data.length, 'cases');
        } else if (response.data.length === 1) {
          console.log('Case found. Performing update.');
          const caseId = response.data[0].id;
          return axios({
            method: 'PUT',
            baseURL: apiUrl,
            url: `/outbreaks/${id}/cases/${caseId}`,
            params: {
              access_token,
            },
            data,
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
        } else {
          console.log('No case found. Performing create.');
          return axios({
            method: 'POST',
            baseURL: apiUrl,
            url: `/outbreaks/${id}/cases/`,
            params: {
              access_token,
            },
            data,
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
        }
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
