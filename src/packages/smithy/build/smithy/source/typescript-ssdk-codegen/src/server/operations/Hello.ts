// @ts-nocheck
// smithy-typescript generated code
import {
  ServerSerdeContext,
  ServiceException as __BaseException,
  InternalFailureException as __InternalFailureException,
  Mux as __Mux,
  Operation as __Operation,
  OperationInput as __OperationInput,
  OperationOutput as __OperationOutput,
  OperationSerializer as __OperationSerializer,
  SerializationException as __SerializationException,
  ServerSerdeContext as __ServerSerdeContext,
  ServiceException as __ServiceException,
  ServiceHandler as __ServiceHandler,
  SmithyFrameworkException as __SmithyFrameworkException,
  ValidationCustomizer as __ValidationCustomizer,
  ValidationFailure as __ValidationFailure,
  isFrameworkException as __isFrameworkException,
  httpbinding,
} from "@aws-smithy/server-common";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@smithy/protocol-http";
import { fromBase64, toBase64 } from "@smithy/util-base64";
import { fromUtf8, toUtf8 } from "@smithy/util-utf8";
import {
  HelloInput,
  HelloOutput,
  InvalidInputError,
} from "../../models/models_0";
import {
  deserializeHelloRequest,
  serializeFrameworkException,
  serializeHelloResponse,
  serializeInvalidInputErrorError,
} from "../../protocols/Aws_restJson1";
import { HelloServiceService } from "../HelloServiceService";

export type Hello<Context> = __Operation<
  HelloServerInput,
  HelloServerOutput,
  Context
>;

export interface HelloServerInput extends HelloInput {}
export namespace HelloServerInput {
  /**
   * @internal
   */
  export const validate: (
    obj: Parameters<typeof HelloInput.validate>[0],
  ) => __ValidationFailure[] = HelloInput.validate;
}
export interface HelloServerOutput extends HelloOutput {}

export type HelloErrors = InvalidInputError;

export class HelloSerializer
  implements
    __OperationSerializer<HelloServiceService<any>, "Hello", HelloErrors>
{
  serialize = serializeHelloResponse;
  deserialize = deserializeHelloRequest;

  isOperationError(error: any): error is HelloErrors {
    const names: HelloErrors["name"][] = ["InvalidInputError"];
    return names.includes(error.name);
  }

  serializeError(
    error: HelloErrors,
    ctx: ServerSerdeContext,
  ): Promise<__HttpResponse> {
    switch (error.name) {
      case "InvalidInputError": {
        return serializeInvalidInputErrorError(error, ctx);
      }
      default: {
        throw error;
      }
    }
  }
}

export const getHelloHandler = <Context>(
  operation: __Operation<HelloServerInput, HelloServerOutput, Context>,
  customizer: __ValidationCustomizer<"Hello">,
): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"HelloService", "Hello">([
    new httpbinding.UriSpec<"HelloService", "Hello">(
      "GET",
      [{ type: "path_literal", value: "hello" }, { type: "path" }],
      [],
      { service: "HelloService", operation: "Hello" },
    ),
  ]);
  return new HelloHandler(
    operation,
    mux,
    new HelloSerializer(),
    serializeFrameworkException,
    customizer,
  );
};

const serdeContextBase = {
  base64Encoder: toBase64,
  base64Decoder: fromBase64,
  utf8Encoder: toUtf8,
  utf8Decoder: fromUtf8,
  streamCollector: streamCollector,
  requestHandler: new NodeHttpHandler(),
  disableHostPrefix: true,
};
async function handle<S, O extends keyof S & string, Context>(
  request: __HttpRequest,
  context: Context,
  operationName: O,
  serializer: __OperationSerializer<S, O, __ServiceException>,
  operation: __Operation<
    __OperationInput<S[O]>,
    __OperationOutput<S[O]>,
    Context
  >,
  serializeFrameworkException: (
    e: __SmithyFrameworkException,
    ctx: __ServerSerdeContext,
  ) => Promise<__HttpResponse>,
  validationFn: (input: __OperationInput<S[O]>) => __ValidationFailure[],
  validationCustomizer: __ValidationCustomizer<O>,
): Promise<__HttpResponse> {
  let input;
  try {
    input = await serializer.deserialize(request, {
      endpoint: () => Promise.resolve(request),
      ...serdeContextBase,
    });
  } catch (error: unknown) {
    if (__isFrameworkException(error)) {
      return serializeFrameworkException(error, serdeContextBase);
    }
    return serializeFrameworkException(
      new __SerializationException(),
      serdeContextBase,
    );
  }
  try {
    let validationFailures = validationFn(input);
    if (validationFailures && validationFailures.length > 0) {
      let validationException = validationCustomizer(
        { operation: operationName },
        validationFailures,
      );
      if (validationException) {
        return serializer.serializeError(validationException, serdeContextBase);
      }
    }
    let output = await operation(input, context);
    return serializer.serialize(output, serdeContextBase);
  } catch (error: unknown) {
    if (serializer.isOperationError(error)) {
      return serializer.serializeError(error, serdeContextBase);
    }
    console.log("Received an unexpected error", error);
    return serializeFrameworkException(
      new __InternalFailureException(),
      serdeContextBase,
    );
  }
}
export class HelloHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<
    HelloServerInput,
    HelloServerOutput,
    Context
  >;
  private readonly mux: __Mux<"HelloService", "Hello">;
  private readonly serializer: __OperationSerializer<
    HelloServiceService<Context>,
    "Hello",
    HelloErrors
  >;
  private readonly serializeFrameworkException: (
    e: __SmithyFrameworkException,
    ctx: __ServerSerdeContext,
  ) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"Hello">;
  /**
   * Construct a Hello handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for Hello
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for Hello that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<HelloServerInput, HelloServerOutput, Context>,
    mux: __Mux<"HelloService", "Hello">,
    serializer: __OperationSerializer<
      HelloServiceService<Context>,
      "Hello",
      HelloErrors
    >,
    serializeFrameworkException: (
      e: __SmithyFrameworkException,
      ctx: __ServerSerdeContext,
    ) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"Hello">,
  ) {
    this.operation = operation;
    this.mux = mux;
    this.serializer = serializer;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(
    request: __HttpRequest,
    context: Context,
  ): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      console.log(
        "Received a request that did not match example.hello#HelloService.Hello. This indicates a misconfiguration.",
      );
      return this.serializeFrameworkException(
        new __InternalFailureException(),
        serdeContextBase,
      );
    }
    return handle(
      request,
      context,
      "Hello",
      this.serializer,
      this.operation,
      this.serializeFrameworkException,
      HelloServerInput.validate,
      this.validationCustomizer,
    );
  }
}
