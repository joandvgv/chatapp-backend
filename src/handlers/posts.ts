import { Handler, APIGatewayProxyResult } from "aws-lambda";
import PostsActions from "../actions/posts.actions";
import { LambdaEvent } from "../types/aws-lambda";
import { applyBaseMiddlewares } from "../middlewares/applyBase.middleware";
import { apiResponse } from "../utils/api";
import { APIError } from "../utils/error";

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
    throw new APIError(400, "Malformed Payload");
  }
  return PostsActions.create(req.body);
};

export const main: Handler<LambdaEvent, APIGatewayProxyResult> = async (
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

export const users = applyBaseMiddlewares(main);
