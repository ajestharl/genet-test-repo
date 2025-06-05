// src/packages/ajithapackage1/src/index.ts

export interface IHelloOptions {
  readonly name: string;
  readonly greeting?: string;
}

export interface IHelloInfo {
  readonly message: string;
  readonly timestamp: string;
}

export class HelloWorld {
  private readonly name: string;
  private readonly greeting: string;

  constructor(options: IHelloOptions) {
    this.name = options.name;
    this.greeting = options.greeting ?? 'Hello';
  }

  public sayHello(): string {
    return `${this.greeting}, ${this.name}!`;
  }

  public generateInfo(): IHelloInfo {
    return {
      message: this.sayHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
