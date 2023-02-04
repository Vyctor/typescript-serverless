import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const { httpMethod } = event;

  if (event.resource === 'products') {
    if (httpMethod === 'GET') {
      console.log('GET');
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
