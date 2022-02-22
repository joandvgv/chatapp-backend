import "reflect-metadata";
import "../database";
import { Handler, APIGatewayProxyResult } from "aws-lambda";
import createHttpError from "http-errors";
import PostsActions from "../actions/posts.actions";
import { LambdaEvent } from "../types/aws-lambda";
import { applyBaseMiddlewares } from "../middlewares/applyBase.middleware";
import { apiResponse } from "../utils/api";
// import { IAuthorizedEvent } from "middy-middleware-jwt-auth";

const getAllPosts = () => {
  return PostsActions.getAll();
};

const createPost = (
  req: LambdaEvent<{
    message: string;
  }>
) => {
  const { message } = req.body;
  if (!message) {
    throw new createHttpError.BadRequest("Malformed Payload");
  }
  return PostsActions.create({
    ...req.body,
    userId: (req as any)["auth"]["payload"]["username"],
  });
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
