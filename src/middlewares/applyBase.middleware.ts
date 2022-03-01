import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpSecurityHeaders from "@middy/http-security-headers";
import { APIGatewayProxyEventV2, Handler } from "aws-lambda";
import errorHandler from "@schibsted/middy-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import JWTAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";
import { isTokenPayload } from "../utils/token";
import httpResponseSerializer from "@middy/http-response-serializer";

export const applyBaseMiddlewares = <T, K>(
  handler: Handler<T, K>,
  requiresAuth = true
) => {
  return (
    middy(handler)
      .use(httpHeaderNormalizer())
      .use(jsonBodyParser())
      .use(httpEventNormalizer())
      .use(httpSecurityHeaders())
      .use(
        httpResponseSerializer({
          serializers: [
            {
              regex: /^application\/json$/,
              serializer: ({ body }) => JSON.stringify(body),
            },
          ],
          default: "application/json",
        })
      )
      // .use(parseErrorsMiddleware())
      .use(errorHandler())
      .use(
        requiresAuth
          ? JWTAuthMiddleware({
              algorithm: EncryptionAlgorithms.HS256,
              credentialsRequired: true,
              isPayload: isTokenPayload,
              secretOrPublicKey: process.env.TOKEN_SECRET as string,
              tokenSource: (event: APIGatewayProxyEventV2) =>
                event.cookies?.[0]?.split("token=")?.[1] as string,
            })
          : { before: () => {} }
      )
  );
};
