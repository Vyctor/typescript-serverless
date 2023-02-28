import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Product, ProductRepository } from '/opt/nodejs/productsLayer';

const productsDynamoDbTableName = process.env.PRODUCTS_TABLE_NAME as string;
const dynamoDbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(dynamoDbClient, productsDynamoDbTableName);

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const { httpMethod } = event;
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.info(`
    API Gateway Request ID: ${apiRequestId}
    Lambda Request ID: ${lambdaRequestId}
    Event ResourceÇ ${event.resource}
    HTTP Method: ${httpMethod}
  `);

  if (event.resource === '/products') {
    const product: Product = JSON.parse(event.body as string);

    const productCreated = await productRepository.create(product);

    if (httpMethod === 'POST') {
      return {
        statusCode: 201,
        body: JSON.stringify(productCreated),
      };
    }
  }

  if (event.resource === '/products/{id}') {
    const productId = event.pathParameters?.id as string;

    try {
      if (httpMethod === 'PUT') {
        const product: Product = JSON.parse(event.body as string);

        const productUpdated = await productRepository.update(productId, product);

        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated),
        };
      }

      if (httpMethod === 'DELETE') {
        const product = await productRepository.delete(productId);

        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      }
    } catch (error) {
      const errorMessage = (<Error>error).message;
      console.error(errorMessage);

      return {
        statusCode: 404,
        body: JSON.stringify({
          message: errorMessage,
        }),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad Request',
    }),
  };
}

export { handler };
