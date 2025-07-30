import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface AjithaConstructProps {
  readonly tableName?: string;
}

export class AjithaConstruct extends Construct {
  readonly table: dynamodb.Table;
  readonly lambdaFunction: lambda.Function;
  readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props?: AjithaConstructProps) {
    super(scope, id);

    // DynamoDB table
    this.table = new dynamodb.Table(this, 'RequestsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: props?.tableName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function
    this.lambdaFunction = new lambda.Function(this, 'AjithaLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.lambdaHandler',
      code: lambda.Code.fromAsset('lib'),
      environment: {
        TABLE_NAME: this.table.tableName,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    this.table.grantWriteData(this.lambdaFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'AjithaApi');
    this.api.root.addMethod('ANY', new apigateway.LambdaIntegration(this.lambdaFunction));
  }
}