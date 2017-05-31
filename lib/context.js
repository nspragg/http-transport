'use strict';

const DEFAULT_TIMEOUT = 1000;

const Request = require('./request');
const Response = require('./request');

class Context {
  constructor() {
    this.plugins = [];
    this.req = Request.create();
    this.res = {}
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  static create() {
    return new Context();
  }
}

module.exports = Context
