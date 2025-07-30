import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

const LAMBDA_NODE_VERSION = lambda.Runtime.NODEJS_14_X;

export const LAMBDA_DEFAULTS = {
  runtime: LAMBDA_NODE_VERSION,
  tracing: lambda.Tracing.ACTIVE,
  bundling: {
    sourceMap: true,
    // The AWS CDK defaults to loading the AWS SDK from external modules.
    // https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda-nodejs.BundlingOptions.html#externalmodules
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.BundlingOptions.html#externalmodules
    // We never want to do that.
    // To ensure that we bundle the AWS SDK into Lambda artifact,
    // override the default value for externalModules.
    externalModules: [],
  },
};

export class AjithaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'RequestsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function
    const lambdaFn = new lambda.Function(this, 'AjithaLambda', {
      ...LAMBDA_DEFAULTS,
      handler: 'index.lambdaHandler',
      code: lambda.Code.fromAsset('lib'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantWriteData(lambdaFn);

    // API Gateway
    const api = new apigateway.RestApi(this, 'AjithaApi');
    api.root.addMethod('ANY', new apigateway.LambdaIntegration(lambdaFn));
  }
}
