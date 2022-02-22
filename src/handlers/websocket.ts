import "reflect-metadata";
import "../database";
import { Handler, APIGatewayEvent } from "aws-lambda";
import { DYNAMODB_WEBSOCKET_TABLE } from "../constants";
import { DynamoTable } from "./../lib/aws/DynamoTable";
import middy from "@middy/core";
// import JWTAuthMiddleware, {
//   EncryptionAlgorithms,
// } from "middy-middleware-jwt-auth";
// import { isTokenPayload } from "../utils/token";

type EventType = "CONNECT" | "DISCONNECT" | "MESSAGE";

// const authMiddleware = JWTAuthMiddleware({
//   algorithm: EncryptionAlgorithms.HS256,
//   credentialsRequired: true,
//   isPayload: isTokenPayload,
//   secretOrPublicKey: process.env.TOKEN_SECRET as string,
// }); TODO: implement

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

export const connection: Handler<APIGatewayEvent> = middy(async (event) => {
  const { connectionId, eventType } = event.requestContext;
  if (!eventType || !connectionId) return;

  const actionMap = {
    CONNECT: persistConnection,
    DISCONNECT: deleteConnection,
  };

  await actionMap[eventType as Exclude<EventType, "MESSAGE">](connectionId);
  return { statusCode: 200 };
});
