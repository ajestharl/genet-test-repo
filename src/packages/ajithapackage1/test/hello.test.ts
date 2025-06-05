// src/packages/ajithapackage1/test/hello.test.ts

import { HelloWorld } from '../src';

describe('HelloWorld', () => {
  test('sayHello returns correct greeting with default', () => {
    const hello = new HelloWorld({ name: 'World' });
    expect(hello.sayHello()).toBe('Hello, World!');
  });

  test('getInfo returns correct structure', () => {
    const hello = new HelloWorld({ name: 'Test', greeting: 'Hi' });
    const info = hello.generateInfo();
    expect(info.message).toBe('Hi, Test!');
    expect(info.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});
