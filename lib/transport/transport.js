'use strict';

class Transport {
  constructor(ctx) {
    this.ctx = ctx;
  }

  execute() {
    const opts = this.toOptions();
    return this.makeRequest(opts)
      .catch(this.onError(this.ctx))
      .then((res) => {
        this.ctx.res = this.toResponse(this.ctx, res);
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
