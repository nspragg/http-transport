'use strict';

class Transport {
  constructor(ctx) {
    this.ctx = ctx;
  }

  toError(err) {
    return this.createError(err);
  }

  createError(err) {
    return new Error(`Request failed for ${this.ctx.req.getMethod()} ${this.ctx.req.getUrl()}: ${err.message}`);
  }

  execute() {
    const opts = this.toOptions();
    return this.makeRequest(opts)
      .catch(this.onError(this.ctx))
      .then((res) => {
        this.ctx.res = this.toResponse(this.ctx, res);
        return this.ctx;
      });
  }

  onError() {
    return (err) => {
      throw this.toError(err, this.ctx);
    };
  }

  toOptions() {}
  toResponse() {}
}

module.exports = Transport;
