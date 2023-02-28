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

  async getAll(): Promise<Array<Product>> {
    const params = {
      TableName: this.tableName,
    };

    const result = await this.dynamoDbClient.scan(params).promise();

    return result.Items as Product[];
  }

  async getById(id: string): Promise<Product> {
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

  async create(product: Product): Promise<Product> {
    product.id = uuid();
    const params = {
      TableName: this.tableName,
      Item: product,
    };

    await this.dynamoDbClient.put(params).promise();

    return params.Item as Product;
  }

  async delete(id: string): Promise<Product> {
    const params = {
      TableName: this.tableName,
      Key: {
        id,
      },
      ReturnValues: 'ALL_OLD',
    };

    const data = await this.dynamoDbClient.delete(params).promise();

    if (!data.Attributes) {
      throw new Error(`Product not found`);
    }

    return data.Attributes as Product;
  }

  async update(id: string, product: Product): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        id,
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'UPDATED_NEW',
      UpdateExpression: 'set productName = :productName, code = :code, price = :price, model = :model',
      ExpressionAttributeValues: {
        ':productName': product.productName,
        ':code': product.code,
        ':price': product.price,
        ':model': product.model,
      },
    };

    const result = await this.dynamoDbClient.update(params).promise();

    if (!result.Attributes?.id) {
      throw new Error(`Product not found`);
    }
  }
}
