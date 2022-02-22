import * as AWS from "aws-sdk";

export class DynamoTable {
  private readonly tableName: string;
  private readonly docClient: AWS.DynamoDB.DocumentClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.docClient = new AWS.DynamoDB.DocumentClient();
  }

  async putDocument<T extends object>(item: T) {
    const params = {
      TableName: this.tableName,
      Item: item,
    };
    await this.docClient.put(params).promise();
  }

  async getDocument<T extends object>(key: T) {
    const params = {
      TableName: this.tableName,
      Key: key,
    };
    return this.docClient.get(params).promise();
  }

  async getDocuments() {
    const params = {
      TableName: this.tableName,
    };
    return this.docClient.scan(params).promise();
  }

  async deleteDocument(key: Object): Promise<any> {
    const params = {
      TableName: this.tableName,
      Key: key,
    };
    return this.docClient.delete(params).promise();
  }

  async scan(params: any, onScan: any) {
    return this.docClient.scan(params, onScan).promise();
  }
}
