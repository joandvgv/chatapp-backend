import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpSecurityHeaders from "@middy/http-security-headers";
import parseRequest from "./parseRequest.middleware";
import { Handler } from "aws-lambda";
import { parseErrorsMiddleware } from "./parseError.middleware";

export const applyBaseMiddlewares = <T, K>(handler: Handler<T, K>) => {
  return middy(handler)
    .use(jsonBodyParser())
    .use(httpEventNormalizer())
    .use(httpSecurityHeaders())
    .use(parseRequest())
    .use(parseErrorsMiddleware())
    .use(httpErrorHandler());
};
