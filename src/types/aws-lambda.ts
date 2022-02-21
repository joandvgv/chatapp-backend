import { APIGatewayProxyEventV2 } from "aws-lambda";

export interface LambdaEvent<T extends object = never>
  extends Omit<APIGatewayProxyEventV2, "body"> {
  body: T;
}
