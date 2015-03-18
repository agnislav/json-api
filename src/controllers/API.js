import Q from "q"
import contentType from "content-type"
import getRawBody from "raw-body"
import pipeline from "../Pipeline"
import RequestContext from "../types/Context/RequestContext"

/**
 * This controller offers the outside world distinct entry points into the
 * pipeline for handling different types of requests. It also acts as the only
 * point of interaction between this library and express. Inside the pipeline,
 * we use the ResponseContext that this controller provides to generate a
 * ResponseContext object, which the controller then turns into a response.
 */
export default class APIController {
  constructor(registry) {
    this.pipeline = pipeline(registry);
  }

  // For requests like GET /:type, GET /:type/:id/:relationship,
  // POST /:type with or without ext=bulk, PATCH /:type/:id,
  // PATCH /:type with ext=bulk, DELETE /:type/:idOrLabel, and
  // DELETE /:type; ext=bulk
  resourceRequest(req, res, next) {
    buildRequestContext(req).then((context) => {
      this.pipeline(context).then((responseContext) => {
        this.sendResources(responseContext, res);
      });
    }, (err) => {
      res.status(err.status).send(err.message);
    });
  }

  // For requests like GET /:type/:id/links/:relationship,
  // PATCH /:type/:id/links/:relationship, POST /:type/:id/links/:relationship,
  // and DELETE /:type/:id/links/:relationship.
  linkObjectRequest(req, res, next) {
    buildRequestContext(req).then((context) => {
      context.aboutLinkObject = true;
      this.pipeline(context).then((responseContext) => {
        this.sendResources(responseContext, res);
      });
    }, (err) => {
      res.status(err.status).send(err.message);
    });
  }

  sendResources(responseContext, res) {
    if(!responseContext.contentType) {
      res.status(406).send();
    }
    else {
      res.set("Content-Type", responseContext.contentType);
      res.status(responseContext.status || 200);

      if(responseContext.body !== null) {
        res.json(responseContext.body).end();
      }
      else {
        res.end();
      }
    }
  }
}

function buildRequestContext(req) {
  return Q.Promise(function(resolve, reject) {
    let context = new RequestContext();

    // Handle route & query params
    context.queryParams  = req.query;
    context.allowLabel   = !!(req.params.idOrLabel && !req.params.id);
    context.idOrIds      = req.params.id || req.params.idOrLabel;
    context.type         = req.params.type;
    context.relationship = req.params.relationship;

    // Handle HTTP/Conneg.
    context.accepts = req.headers.accept;
    context.method  = req.method.toLowerCase();

    context.hasBody = hasBody(req);

    if(context.hasBody) {
      let typeParsed = contentType.parse(req);
      let bodyParserOptions = {};

      context.contentType  = typeParsed.type;
      if(typeParsed.parameters.ext) {
        context.ext = typeParsed.parameters.ext.split(",");
      }

      bodyParserOptions.encoding = typeParsed.parameters.charset || "utf8";
      bodyParserOptions.limit = "1mb";
      if(req.headers["content-length"] && !isNaN(req.headers["content-length"])) {
        bodyParserOptions.length = req.headers["content-length"];
      }

      getRawBody(req, bodyParserOptions, function(err, string) {
        if(err) { reject(err); }
        else {
          try {
            context.body = JSON.parse(string);
            resolve(context);
          }
          catch (error) {
            let parseErr = new Error("Request contains invalid JSON.");
            parseErr.status = err.statusCode = 400;
            reject(err);
          }
        }
      });
    }
    else {
      context.body = null;
      resolve(context);
    }
  });
}

function hasBody(req) {
  return req.headers["transfer-encoding"] !== undefined
    || !isNaN(req.headers["content-length"]);
}
