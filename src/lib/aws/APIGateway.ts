import * as AWS from "aws-sdk";

export class APIGateway {
  private readonly api;

  constructor(endpoint: string) {
    this.api = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint,
    });
  }

  async sendMessage<T extends object>(connectionId: string, data: T) {
    return this.api
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          action: "SOCKET_MESSAGE",
          ...data,
        }),
      })
      .promise();
  }
}
