// src/packages/ajithapackage1/test/hello.test.ts

import { App, Stack } from 'aws-cdk-lib';
import { HelloWorldConstruct } from '../src';

describe('HelloWorldConstruct', () => {
  test('sayHello returns correct greeting with default', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const construct = new HelloWorldConstruct(stack, 'MyHello', {
      name: 'World',
    });

    expect(construct.sayHello()).toBe('Hello, World!');
  });

  test('getInfo returns correct structure', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const construct = new HelloWorldConstruct(stack, 'MyHello', {
      name: 'Test',
      greeting: 'Hi',
    });

    const info = construct.generateInfo();
    expect(info.message).toBe('Hi, Test!');
    expect(info.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});
