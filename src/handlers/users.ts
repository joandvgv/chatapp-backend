import "reflect-metadata";
import "../database";
import { Handler, APIGatewayProxyResult } from "aws-lambda";
import UsersActions from "../actions/users.actions";
import { LambdaEvent } from "./../types/aws-lambda";
import { applyBaseMiddlewares } from "./../middlewares/applyBase.middleware";
import { apiResponse } from "./../utils/api";
import { APIError } from "../utils/error";

const getAllUsers = () => {
  return UsersActions.getAll();
};

const getUserById = (req: LambdaEvent) => {
  return UsersActions.getById(req.pathParameters?.username ?? "");
};

const createUser = (
  req: LambdaEvent<{
    firstName: string;
    lastName: string;
  }>
) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    throw new APIError(400, "Malformed Payload");
  }
  return UsersActions.create(req.body);
};

export const users: Handler<LambdaEvent, APIGatewayProxyResult> = async (
  event
) => {
  const mappingFunction: Record<string, (event: LambdaEvent) => any> = {
    "GET /users": getAllUsers,
    "GET /users/{username}": getUserById,
    "POST /users": createUser,
  };

  const path = event.routeKey;
  const fn = mappingFunction[path];

  return apiResponse(200, await fn(event));
};

export const main = applyBaseMiddlewares(users);
