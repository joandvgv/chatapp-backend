import "reflect-metadata";
import "../database";
import { Handler, APIGatewayProxyResult } from "aws-lambda";
import UsersActions from "../actions/users.actions";
import { LambdaEvent } from "./../types/aws-lambda";
import { applyBaseMiddlewares } from "./../middlewares/applyBase.middleware";
import { apiResponse } from "./../utils/api";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

const getAllUsers = async () => {
  return { users: await UsersActions.getAll() };
};

const getUserById = (req: LambdaEvent) => {
  return UsersActions.getById(req.pathParameters?.username ?? "");
};

const createUser = async (
  req: LambdaEvent<{
    firstName: string;
    lastName: string;
  }>
) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    throw createHttpError(400, "Malformed Payload");
  }
  const user = await UsersActions.create(req.body);
  const token = jwt.sign(
    {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    },
    process.env.TOKEN_SECRET as string,
    {
      expiresIn: "1 hour",
    }
  );
  return { user, token };
};

export const newUser: Handler<LambdaEvent, APIGatewayProxyResult> = async (
  event
) => {
  const { user, token } = await createUser(event);

  return apiResponse(
    200,
    { user, token },
    {
      "Set-Cookie": `token=${token}; SameSite=None; HttpOnly; Secure`,
    }
  );
};
export const users: Handler<LambdaEvent, APIGatewayProxyResult> = async (
  event
) => {
  const mappingFunction: Record<string, (event: LambdaEvent) => any> = {
    "GET /users": getAllUsers,
    "GET /users/{username}": getUserById,
  };

  const path = event.routeKey;
  const fn = mappingFunction[path];

  return apiResponse(200, await fn(event));
};

export const main = applyBaseMiddlewares(users);
export const mainNewUsers = applyBaseMiddlewares(newUser, false);
