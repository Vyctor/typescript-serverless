import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import * as awsXray from 'aws-xray-sdk';
import * as awsSdk from 'aws-sdk';

import { ProductRepository } from '/opt/nodejs/productsLayer';

awsXray.captureAWS(awsSdk);

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
    if (httpMethod === 'GET') {
      console.info('GET');

      const products = await productRepository.getAll();

      return {
        statusCode: 200,
        body: JSON.stringify({
          products,
        }),
      };
    }
  }

  if (event.resource === '/products/{id}') {
    const productId = event.pathParameters?.id as string;

    if (httpMethod === 'GET') {
      console.info('GET');

      try {
        const product = await productRepository.getById(productId);

        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
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
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad Request',
    }),
  };
}

export { handler };
