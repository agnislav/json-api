"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.checkBodyExistence = checkBodyExistence;
exports.checkBodyIsValidJSONAPI = checkBodyIsValidJSONAPI;
exports.checkContentType = checkContentType;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var Q = _interopRequire(require("q"));

var APIError = _interopRequire(require("../../types/APIError"));

function checkBodyExistence(requestContext) {
  return Q.Promise(function (resolve, reject) {
    var needsBody = ["post", "patch"].indexOf(requestContext.method) !== -1;
    if (requestContext.hasBody === needsBody) {
      resolve();
    } else if (needsBody) {
      reject(new APIError(400, null, "This request needs a body, but didn't have one."));
    } else {
      reject(new APIError(400, null, "This request should not have a body, but does."));
    }
  });
}

function checkBodyIsValidJSONAPI(body) {
  return Q.Promise(function (resolve, reject) {
    var ownProp = Object.prototype.hasOwnProperty;
    if (typeof body !== "object" || !ownProp.call(body, "data")) {
      reject(new APIError(400, null, "Request body is not a valid JSON API document."));
    } else {
      resolve();
    }
  });
}

function checkContentType(requestContext, supportedExt) {
  // From the spec: The value of the ext media type parameter... MUST
  // be limited to a subset of the extensions supported by the server.
  var invalidExt = requestContext.ext.filter(function (v) {
    return supportedExt.indexOf(v) === -1;
  });

  return Q.Promise(function (resolve, reject) {
    if (requestContext.contentType !== "application/vnd.api+json") {
      var message = "The request's Content-Type must be application/vnd.api+json, " + "optionally including an ext parameter whose value is a comma-separated " + ("list of supported extensions, which include: " + supportedExt.join(",") + ".");

      reject(new APIError(415, null, message));
    } else if (invalidExt.length) {
      var message = "You're requesting the following unsupported extensions: " + ("" + invalidExt.join(",") + ". The server supports only the extensions: ") + ("" + supportedExt.join(",") + ".");

      reject(new APIError(415, null, message));
    } else {
      resolve();
    }
  });
}