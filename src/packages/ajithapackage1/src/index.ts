import { Metrics } from '@aws-lambda-powertools/metrics';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import * as AWSXRay from 'aws-xray-sdk';
import { ExampleClient, GetItemCommand } from 'my-service-client';

const dynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const metrics = new Metrics({ namespace: 'AjithaPackage' });
const exampleClient = new ExampleClient({});

export { Hello } from './hello';
export { AjithaConstruct } from './ajitha-construct';
export type { AjithaConstructProps } from './ajitha-construct';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  metrics.addMetric('LambdaInvocation', 'Count', 1);

  try {
    const tableName = process.env.TABLE_NAME || 'default-table';

    await dynamoClient.send(
      new PutItemCommand({
        TableName: tableName,
        Item: marshall({
          id: context.awsRequestId,
          timestamp: new Date().toISOString(),
          path: event.path,
        }),
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Success',
        requestId: context.awsRequestId,
      }),
    };
  } catch (error: unknown) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed' }),
    };
  } finally {
    metrics.publishStoredMetrics();
  }
};

export const webhookHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const payload = JSON.parse(event.body || '{}');

  // Test SSDK interdependency
  let ssdkResult = null;
  if (payload.itemId) {
    try {
      ssdkResult = await exampleClient.send(
        new GetItemCommand({ id: payload.itemId }),
      );
    } catch (error) {
      console.log('SSDK call failed:', error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Webhook received',
      action: payload.action || 'unknown',
      ssdkData: ssdkResult,
    }),
  };
};
