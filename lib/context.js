'use strict';

const DEFAULT_TIMEOUT = 1000;

class Context {
  constructor() {
    this._queries = {};
    this._headers = {};
    this._plugins = [];
    this._timeout = undefined;
    this._method = undefined;
    this._url = undefined;
    this._req = {
      query: this._queries,
      headers: this._headers
    };
  }

  addQuery(k, v) {
    this._queries[k] = v;
    return this;
  }

  addHeader(k, v) {
    this._headers[k] = v;
    return this;
  }

  addPlugin(plugin) {
    this._plugins.push(plugin);
    return this;
  }

  setMethod(method) {
    this._method = method;
    return this;
  }

  setUrl(url) {
    this._url = url;
    return this;
  }

  setTimeout(timeout) {
    this._timeout = timeout;
    return this;
  }

  getTimeout() {
    return this._timeout || DEFAULT_TIMEOUT;
  }

  getUrl() {
    return this._url;
  }

  getPlugins() {
    return this._plugins;
  }

  getHeaders() {
    return this._headers;
  }

  getQueries() {
    return this._queries;
  }

  hasQueries() {
    return Object.keys(this._queries).length > 0;
  }

  hasHeaders() {
    return Object.keys(this._headers).length > 0;
  }

  getMethod() {
    return this._method;
  }

  static create() {
    return new Context();
  }
}

module.exports = Context
