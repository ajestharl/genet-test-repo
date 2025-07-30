#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AjithaStack } from './src/stack';

const app = new cdk.App();
new AjithaStack(app, 'AjithaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
