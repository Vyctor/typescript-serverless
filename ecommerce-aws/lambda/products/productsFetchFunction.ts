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
    if (httpMethod === 'GET') {
      console.info('GET');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'GET Products - OK',
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
