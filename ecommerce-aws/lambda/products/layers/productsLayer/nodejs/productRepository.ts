import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuid } from 'uuid';

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
}

export class ProductRepository {
  private dynamoDbClient: DocumentClient;
  private tableName: string;

  constructor(dynamoDbClient: DocumentClient, tableName: string) {
    this.dynamoDbClient = dynamoDbClient;
    this.tableName = tableName;
  }
}
