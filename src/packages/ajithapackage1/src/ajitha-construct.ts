import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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

    console.log('AjithaConstruct: Starting construction...');
    console.log('AjithaConstruct: Creating construct with ID: ' + id);

    const tableName = props?.tableName || id + '-requests-table';
    console.log('AjithaConstruct: Creating DynamoDB table: ' + tableName);

    this.table = new dynamodb.Table(this, 'RequestsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: props?.tableName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    console.log(
      'AjithaConstruct: Creating Lambda function with bundled dependencies...',
    );

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

    console.log('AjithaConstruct: Creating API Gateway...');

    this.api = new apigateway.RestApi(this, 'AjithaApi');
    this.api.root.addMethod(
      'ANY',
      new apigateway.LambdaIntegration(this.lambdaFunction),
    );
    console.log('AjithaConstruct: Construction completed successfully!');
    console.log('AjithaConstruct: Resources created');
  }
}
