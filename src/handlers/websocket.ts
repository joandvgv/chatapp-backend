import "reflect-metadata";
import "../database";
import { APIGatewayEvent } from "aws-lambda";
import { DYNAMODB_WEBSOCKET_TABLE } from "../constants";
import { DynamoTable } from "./../lib/aws/DynamoTable";
import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import errorHandler from "@schibsted/middy-error-handler";

type EventType = "CONNECT" | "DISCONNECT" | "MESSAGE";

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
  .use(errorHandler());
