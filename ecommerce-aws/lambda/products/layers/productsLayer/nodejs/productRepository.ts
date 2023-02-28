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

  async getAllProducts(): Promise<Array<Product>> {
    const params = {
      TableName: this.tableName,
    };

    const result = await this.dynamoDbClient.scan(params).promise();

    return result.Items as Product[];
  }

  async getProductById(id: string): Promise<Product> {
    const params = {
      TableName: this.tableName,
      Key: {
        id,
      },
    };

    const result = await this.dynamoDbClient.get(params).promise();

    if (!result.Item) {
      throw new Error(`Product not found`);
    }

    return result.Item as Product;
  }

  async createProduct(product: Product): Promise<Product> {
    product.id = uuid();
    const params = {
      TableName: this.tableName,
      Item: product,
    };

    await this.dynamoDbClient.put(params).promise();

    return params.Item as Product;
  }
}
