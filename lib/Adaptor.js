"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.listContacts = listContacts;
exports.getContact = getContact;
exports.upsertContact = upsertContact;
exports.listOutbreaks = listOutbreaks;
exports.getOutbreak = getOutbreak;
exports.upsertOutbreak = upsertOutbreak;
exports.listCases = listCases;
exports.getCase = getCase;
exports.upsertCase = upsertCase;
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});

var _languageCommon = require("language-common");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
function execute() {
  for (var _len = arguments.length, operations = new Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };
  return function (state) {
    return _languageCommon.execute.apply(void 0, [login].concat(operations))(_objectSpread(_objectSpread({}, initialState), state))["catch"](function (e) {
      console.error(e);
      /* logout(); */

      process.exit(1);
    });
  };
}

function login(state) {
  var _state$configuration = state.configuration,
      host = _state$configuration.host,
      password = _state$configuration.password,
      email = _state$configuration.email;
  return (0, _axios["default"])({
    method: 'post',
    url: "".concat(host, "/users/login"),
    data: {
      email: email,
      password: password
    }
  }).then(function (response) {
    console.log('Authentication succeeded.');
    var id = response.data.id;
    return _objectSpread(_objectSpread({}, state), {}, {
      configuration: {
        host: host,
        access_token: id
      }
    });
  });
}

function logout(state) {
  var _state$configuration2 = state.configuration,
      host = _state$configuration2.host,
      access_token = _state$configuration2.access_token;
  return (0, _axios["default"])({
    method: 'post',
    url: "".concat(host, "/users/logout?access_token=").concat(access_token)
  }).then(function () {
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


function listContacts(id, params, callback) {
  return function (state) {
    var _state$configuration3 = state.configuration,
        host = _state$configuration3.host,
        access_token = _state$configuration3.access_token;

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        headers = _expandReferences.headers,
        body = _expandReferences.body,
        options = _expandReferences.options,
        rest = _objectWithoutProperties(_expandReferences, ["headers", "body", "options"]);

    return (0, _axios["default"])({
      method: 'GET',
      baseURL: host,
      url: "/outbreaks/".concat(id, "/contacts"),
      params: {
        access_token: access_token
      }
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    })["catch"](function (error) {
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


function getContact(id, query, params, callback) {
  return function (state) {
    var _state$configuration4 = state.configuration,
        host = _state$configuration4.host,
        access_token = _state$configuration4.access_token;

    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state),
        headers = _expandReferences2.headers,
        body = _expandReferences2.body,
        options = _expandReferences2.options,
        rest = _objectWithoutProperties(_expandReferences2, ["headers", "body", "options"]);

    var filter = JSON.stringify(query);
    return (0, _axios["default"])({
      baseURL: host,
      url: "/outbreaks/".concat(id, "/contacts"),
      method: 'GET',
      params: {
        filter: filter,
        access_token: access_token
      }
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    })["catch"](function (error) {
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


function upsertContact(id, externalId, params, callback) {
  return function (state) {
    var _state$configuration5 = state.configuration,
        host = _state$configuration5.host,
        access_token = _state$configuration5.access_token;

    var _expandReferences3 = (0, _languageCommon.expandReferences)(params)(state),
        data = _expandReferences3.data,
        headers = _expandReferences3.headers,
        body = _expandReferences3.body,
        options = _expandReferences3.options,
        rest = _objectWithoutProperties(_expandReferences3, ["data", "headers", "body", "options"]);

    var query = {
      where: {}
    };
    query.where[externalId] = data[externalId];
    var filter = JSON.stringify(query);
    return (0, _axios["default"])({
      baseURL: host,
      url: "/outbreaks/".concat(id, "/contacts"),
      method: 'GET',
      params: {
        filter: filter,
        access_token: access_token
      }
    }).then(function (response) {
      if (response.data.length > 1) {
        console.log('Multiple contacts found. Aborting upsert.');
        console.log(response.data.length, 'contacts');
      } else if (response.data.length === 1) {
        console.log('Contact found. Performing update.');
        var contactId = response.data[0].id;
        return (0, _axios["default"])({
          method: 'PATCH',
          baseURL: host,
          url: "/outbreaks/".concat(id, "/contacts/").concat(contactId),
          params: {
            access_token: access_token
          },
          data: data
        }).then(function (response) {
          var nextState = (0, _languageCommon.composeNextState)(state, response.data);
          if (callback) return callback(nextState);
          return nextState;
        })["catch"](function (error) {
          console.log(error);
          return error;
        });
      } else {
        console.log('No contact found. Performing create.');
        return (0, _axios["default"])({
          method: 'POST',
          baseURL: host,
          url: "/outbreaks/".concat(id, "/contacts/"),
          params: {
            access_token: access_token
          },
          data: data
        }).then(function (response) {
          var nextState = (0, _languageCommon.composeNextState)(state, response.data);
          if (callback) return callback(nextState);
          return nextState;
        })["catch"](function (error) {
          console.log(error);
          return error;
        });
      }
    })["catch"](function (error) {
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


function listOutbreaks(params, callback) {
  return function (state) {
    var _state$configuration6 = state.configuration,
        host = _state$configuration6.host,
        access_token = _state$configuration6.access_token;

    var _expandReferences4 = (0, _languageCommon.expandReferences)(params)(state),
        headers = _expandReferences4.headers,
        body = _expandReferences4.body,
        options = _expandReferences4.options,
        rest = _objectWithoutProperties(_expandReferences4, ["headers", "body", "options"]);

    return (0, _axios["default"])({
      method: 'GET',
      baseURL: host,
      url: '/outbreaks',
      params: {
        access_token: access_token
      }
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    })["catch"](function (error) {
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


function getOutbreak(query, params, callback) {
  return function (state) {
    var _state$configuration7 = state.configuration,
        host = _state$configuration7.host,
        access_token = _state$configuration7.access_token;

    var _expandReferences5 = (0, _languageCommon.expandReferences)(params)(state),
        headers = _expandReferences5.headers,
        body = _expandReferences5.body,
        options = _expandReferences5.options,
        rest = _objectWithoutProperties(_expandReferences5, ["headers", "body", "options"]);

    var filter = JSON.stringify(query);
    return (0, _axios["default"])({
      method: 'GET',
      baseURL: host,
      url: '/outbreaks',
      params: {
        filter: filter,
        access_token: access_token
      }
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    })["catch"](function (error) {
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


function upsertOutbreak(params, callback) {
  return function (state) {
    var _state$configuration8 = state.configuration,
        host = _state$configuration8.host,
        access_token = _state$configuration8.access_token;

    var _expandReferences6 = (0, _languageCommon.expandReferences)(params)(state),
        externalId = _expandReferences6.externalId,
        data = _expandReferences6.data,
        headers = _expandReferences6.headers,
        body = _expandReferences6.body,
        options = _expandReferences6.options,
        rest = _objectWithoutProperties(_expandReferences6, ["externalId", "data", "headers", "body", "options"]);

    var filter = JSON.stringify({
      where: {
        id: externalId
      }
    });
    return (0, _axios["default"])({
      method: 'GET',
      baseURL: host,
      url: '/outbreaks',
      params: {
        filter: filter,
        access_token: access_token
      }
    }).then(function (response) {
      if (response.data.length > 0) {
        console.log('Outbreak found. Performing update.');
        var outbreakId = response.data[0].id;
        return (0, _axios["default"])({
          method: 'PUT',
          url: "/outbreaks/".concat(outbreakId),
          params: {
            access_token: access_token
          },
          data: data
        }).then(function (response) {
          var nextState = (0, _languageCommon.composeNextState)(state, response.data);
          if (callback) return callback(nextState);
          return nextState;
        })["catch"](function (error) {
          console.log(error);
          return error;
        });
      } else {
        console.log('No outbreak found. Performing create.');
        return (0, _axios["default"])({
          method: 'POST',
          baseURL: host,
          url: '/outbreaks',
          params: {
            access_token: access_token
          },
          data: data
        }).then(function (response) {
          var nextState = (0, _languageCommon.composeNextState)(state, response.data);
          if (callback) return callback(nextState);
          return nextState;
        })["catch"](function (error) {
          console.log(error);
          return error;
        });
      }
    })["catch"](function (error) {
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


function listCases(id, params, callback) {
  return function (state) {
    var _state$configuration9 = state.configuration,
        host = _state$configuration9.host,
        access_token = _state$configuration9.access_token;

    var _expandReferences7 = (0, _languageCommon.expandReferences)(params)(state),
        headers = _expandReferences7.headers,
        body = _expandReferences7.body,
        options = _expandReferences7.options,
        rest = _objectWithoutProperties(_expandReferences7, ["headers", "body", "options"]);

    return (0, _axios["default"])({
      method: 'GET',
      baseURL: host,
      url: "/outbreaks/".concat(id, "/cases"),
      params: {
        access_token: access_token
      }
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    })["catch"](function (error) {
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


function getCase(id, query, params, callback) {
  return function (state) {
    var _state$configuration10 = state.configuration,
        host = _state$configuration10.host,
        access_token = _state$configuration10.access_token;

    var _expandReferences8 = (0, _languageCommon.expandReferences)(params)(state),
        headers = _expandReferences8.headers,
        body = _expandReferences8.body,
        options = _expandReferences8.options,
        rest = _objectWithoutProperties(_expandReferences8, ["headers", "body", "options"]);

    var filter = JSON.stringify(query);
    return (0, _axios["default"])({
      baseURL: host,
      url: "/outbreaks/".concat(id, "/cases"),
      method: 'GET',
      params: {
        filter: filter,
        access_token: access_token
      }
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    })["catch"](function (error) {
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


function upsertCase(id, externalId, params, callback) {
  return function (state) {
    var _state$configuration11 = state.configuration,
        host = _state$configuration11.host,
        access_token = _state$configuration11.access_token;

    var _expandReferences9 = (0, _languageCommon.expandReferences)(params)(state),
        data = _expandReferences9.data,
        headers = _expandReferences9.headers,
        body = _expandReferences9.body,
        options = _expandReferences9.options,
        rest = _objectWithoutProperties(_expandReferences9, ["data", "headers", "body", "options"]);

    var query = {
      where: {}
    };
    query.where[externalId] = data[externalId];
    var filter = JSON.stringify(query);
    return (0, _axios["default"])({
      baseURL: host,
      url: "/outbreaks/".concat(id, "/cases"),
      method: 'GET',
      params: {
        filter: filter,
        access_token: access_token
      }
    }).then(function (response) {
      if (response.data.length > 1) {
        console.log('Multiple cases found. Aborting upsert.');
        console.log(response.data.length, 'cases');
      } else if (response.data.length === 1) {
        console.log('Case found. Performing update.');
        var caseId = response.data[0].id;
        return (0, _axios["default"])({
          method: 'PATCH',
          baseURL: host,
          url: "/outbreaks/".concat(id, "/cases/").concat(caseId),
          params: {
            access_token: access_token
          },
          data: data
        }).then(function (response) {
          var nextState = (0, _languageCommon.composeNextState)(state, response.data);
          if (callback) return callback(nextState);
          return nextState;
        })["catch"](function (error) {
          console.log(error);
          return error;
        });
      } else {
        console.log('No case found. Performing create.');
        return (0, _axios["default"])({
          method: 'POST',
          baseURL: host,
          url: "/outbreaks/".concat(id, "/cases/"),
          params: {
            access_token: access_token
          },
          data: data
        }).then(function (response) {
          var nextState = (0, _languageCommon.composeNextState)(state, response.data);
          if (callback) return callback(nextState);
          return nextState;
        })["catch"](function (error) {
          console.log(error);
          return error;
        });
      }
    })["catch"](function (error) {
      console.log(error);
      return error;
    });
  };
} // Note that we expose the entire axios package to the user here.


exports.axios = _axios["default"]; // What functions do you want from the common adaptor?
