import "reflect-metadata";
import "../database";
import { Handler, APIGatewayProxyResult } from "aws-lambda";
import createHttpError from "http-errors";
import PostsActions from "../actions/posts.actions";
import { LambdaEvent } from "../types/aws-lambda";
import { applyBaseMiddlewares } from "../middlewares/applyBase.middleware";
import { apiResponse } from "../utils/api";
import { DynamoTable } from "../lib/aws/DynamoTable";
import { DYNAMODB_WEBSOCKET_TABLE, WEBSOCKET_ENDPOINT } from "../constants";
import { APIGateway } from "./../lib/aws/APIGateway";
import UsersActions from "./../actions/users.actions";

const getAllPosts = async () => {
  return { posts: await PostsActions.getAll() };
};

const createPost = async (
  req: LambdaEvent<{
    message: string;
  }>
) => {
  const { message } = req.body;
  if (!message) {
    throw new createHttpError.BadRequest("Malformed Payload");
  }
  const dynamoTable = new DynamoTable(DYNAMODB_WEBSOCKET_TABLE);
  const websocket = new APIGateway(WEBSOCKET_ENDPOINT);
  const username = (req as any)["auth"]["payload"]["username"]; //TODO: fix type info

  const post = await PostsActions.create({
    ...req.body,
    userId: username,
  });
  const user = await UsersActions.getById(username);

  const { Items: connections } = await dynamoTable.getDocuments();

  if (!connections?.length) return post;

  const promises = connections.map(({ connectionId }) =>
    websocket.sendMessage(connectionId, {
      message,
      user: user,
    })
  );

  const result = await Promise.allSettled(promises ?? []);
  const rejectedPromises = result.filter((item) => item.status === "rejected");
  const cleanStalledConnections = rejectedPromises.map((_, idx) =>
    dynamoTable.deleteDocument({ connectionId: connections[idx].connectionId })
  );
  await Promise.all(cleanStalledConnections);

  return post;
};

export const posts: Handler<LambdaEvent, APIGatewayProxyResult> = async (
  event
) => {
  const mappingFunction: Record<string, (event: LambdaEvent) => any> = {
    "GET /posts": getAllPosts,
    "POST /posts": createPost,
  };

  const path = event.routeKey;
  const fn = mappingFunction[path];

  return apiResponse(200, await fn(event));
};

export const main = applyBaseMiddlewares(posts);
