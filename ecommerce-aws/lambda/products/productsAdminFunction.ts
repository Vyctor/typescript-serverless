import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

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
    if (httpMethod === 'POST') {
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'POST /products - OK',
        }),
      };
    }
  }

  if (event.resource === '/products/{id}') {
    const productId = event.pathParameters?.id as string;

    if (httpMethod === 'PUT') {
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: `GET /products/${productId}`,
        }),
      };
    }

    if (httpMethod === 'DELETE') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `DELETE /products/${productId}`,
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
