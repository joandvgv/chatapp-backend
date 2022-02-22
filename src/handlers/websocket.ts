import "reflect-metadata";
import "../database";
import { APIGatewayEvent } from "aws-lambda";
import { DYNAMODB_WEBSOCKET_TABLE } from "../constants";
import { DynamoTable } from "./../lib/aws/DynamoTable";
import middy from "@middy/core";
import JWTAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";
import { isTokenPayload } from "../utils/token";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import errorHandler from "@schibsted/middy-error-handler";

type EventType = "CONNECT" | "DISCONNECT" | "MESSAGE";

const authMiddleware = JWTAuthMiddleware({
  algorithm: EncryptionAlgorithms.HS256,
  credentialsRequired: false,
  isPayload: isTokenPayload,
  secretOrPublicKey: process.env.TOKEN_SECRET as string,
  tokenSource: (event: APIGatewayEvent) => event.headers.authorization ?? "", //we need it as websocket payload is slightly different so library checks fail to pull it
});

const persistConnection = (connectionId: string) => {
  const dynamoTable = new DynamoTable(DYNAMODB_WEBSOCKET_TABLE);
  return dynamoTable.putDocument({
    connectionId,
  });
};

const deleteConnection = (connectionId: string) => {
  const dynamoTable = new DynamoTable(DYNAMODB_WEBSOCKET_TABLE);
  return dynamoTable.deleteDocument({ connectionId });
};

export const connection = middy(async (event: APIGatewayEvent) => {
  const { connectionId, eventType: _eventType } = event.requestContext;
  const eventType = _eventType as Exclude<EventType, "MESSAGE">;

  if (eventType === "CONNECT" && !event.headers.authorization) {
    return {
      statusCode: 401,
    };
  }

  if (!connectionId)
    return {
      statusCode: 400,
    };

  const actionMap = {
    CONNECT: persistConnection,
    DISCONNECT: deleteConnection,
  };

  await actionMap[eventType](connectionId);
  return { statusCode: 200 };
})
  .use(httpHeaderNormalizer())
  .use(authMiddleware)
  .use(errorHandler());
