// src/packages/ajithapackage1/src/index.ts

import { Construct } from 'constructs';

export interface HelloWorldProps {
  readonly name: string;
  readonly greeting?: string;
}

export interface HelloInfo {
  readonly message: string;
  readonly timestamp: string;
}

export class HelloWorldConstruct extends Construct {
  private readonly name: string;
  private readonly greeting: string;

  constructor(scope: Construct, id: string, props: HelloWorldProps) {
    super(scope, id);

    this.name = props.name;
    this.greeting = props.greeting ?? 'Hello';
  }

  public sayHello(): string {
    return `${this.greeting}, ${this.name}!`;
  }

  public generateInfo(): HelloInfo {
    return {
      message: this.sayHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
