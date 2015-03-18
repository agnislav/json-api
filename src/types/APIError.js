import polyfill from "babel/polyfill"

let nonEnumerable = {writable: true, enumerable: false};

export default class APIError extends Error {
  /*eslint-disable no-unused-vars */
  constructor(status, code, title, detail, links, paths) {
    // Hack around lack of proxy support and default non-enumerability
    // of class accessor properties, while still giving us validation.
    Object.defineProperty(this, "_status", nonEnumerable);
    Object.defineProperty(this, "_code", nonEnumerable);
    Object.defineProperty(this, "status", {
      enumerable: true,
      get: () => this._status,
      set: (value) => {
        if(typeof value !== "undefined" && value !== null) {
          this._status = String(value).toString();
        }
        else {
          this._status = value;
        }
      }
    });
    Object.defineProperty(this, "code", {
      enumerable: true,
      get: () => this._code,
      set: (value) => {
        if(typeof value !== "undefined" && value !== null) {
          this._code = String(value).toString();
        }
        else {
          this._code = value;
        }
      }
    });

    [this.status, this.code, this.title, this.detail, this.links, this.paths] = Array.from(arguments);
  }
  /*eslint-enable */

  /**
   * Creates a JSON-API Compliant Error Object from a JS Error object
   *
   * Note: the spec allows error objects to have arbitrary properties
   * beyond the ones for which it defines a meaning (ie. id, href, code,
   * status, path, etc.), but this function strips out all such properties
   * in order to offer a neater result (as JS error objects often contain
   * all kinds of crap).
   */
  static fromError(err) {
    return new APIError(
      err.status || err.statusCode || 500,
      err.code,     // most of the parameters below
      err.title,    // will probably be null/undefined,
      err.message,  // but that's fine.
      err.links,
      err.paths
    );
  }
}
