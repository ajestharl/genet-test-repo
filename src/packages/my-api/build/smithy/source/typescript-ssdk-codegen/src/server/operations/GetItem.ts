/* eslint-disable */
// @ts-nocheck
// smithy-typescript generated code
import {
  GetItemInput,
  GetItemOutput,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeGetItemRequest,
  serializeFrameworkException,
  serializeGetItemResponse,
  serializeValidationExceptionError,
} from "../../protocols/Aws_restJson1";
import { ExampleServiceService } from "../ExampleServiceService";
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
import {
  NodeHttpHandler,
  streamCollector,
} from "@smithy/node-http-handler";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@smithy/protocol-http";
import {
  fromBase64,
  toBase64,
} from "@smithy/util-base64";
import {
  fromUtf8,
  toUtf8,
} from "@smithy/util-utf8";

export type GetItem<Context> = __Operation<GetItemServerInput, GetItemServerOutput, Context>

export interface GetItemServerInput extends GetItemInput {}
export namespace GetItemServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof GetItemInput.validate>[0]) => __ValidationFailure[] = GetItemInput.validate;
}
export interface GetItemServerOutput extends GetItemOutput {}

export type GetItemErrors = ValidationException

export class GetItemSerializer implements __OperationSerializer<ExampleServiceService<any>, "GetItem", GetItemErrors> {
  serialize = serializeGetItemResponse;
  deserialize = deserializeGetItemRequest;

  isOperationError(error: any): error is GetItemErrors {
    const names: GetItemErrors['name'][] = ["ValidationException"];
    return names.includes(error.name);
  };

  serializeError(error: GetItemErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
    switch (error.name) {
      case "ValidationException": {
        return serializeValidationExceptionError(error, ctx);
      }
      default: {
        throw error;
      }
    }
  }

}

export const getGetItemHandler = <Context>(operation: __Operation<GetItemServerInput, GetItemServerOutput, Context>, customizer: __ValidationCustomizer<"GetItem">): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"ExampleService", "GetItem">([
    new httpbinding.UriSpec<"ExampleService", "GetItem">(
      'GET',
      [
        { type: 'path_literal', value: "items" },
        { type: 'path' },
      ],
      [
      ],
      { service: "ExampleService", operation: "GetItem" }),
  ]);
  return new GetItemHandler(operation, mux, new GetItemSerializer(), serializeFrameworkException, customizer);
}

const serdeContextBase = {
  base64Encoder: toBase64,
  base64Decoder: fromBase64,
  utf8Encoder: toUtf8,
  utf8Decoder: fromUtf8,
  streamCollector: streamCollector,
  requestHandler: new NodeHttpHandler(),
  disableHostPrefix: true
};
async function handle<S, O extends keyof S & string, Context>(
  request: __HttpRequest,
  context: Context,
  operationName: O,
  serializer: __OperationSerializer<S, O, __ServiceException>,
  operation: __Operation<__OperationInput<S[O]>, __OperationOutput<S[O]>, Context>,
  serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
  validationFn: (input: __OperationInput<S[O]>) => __ValidationFailure[],
  validationCustomizer: __ValidationCustomizer<O>
): Promise<__HttpResponse> {
  let input;
  try {
    input = await serializer.deserialize(request, {
      endpoint: () => Promise.resolve(request), ...serdeContextBase
    });
  } catch (error: unknown) {
    if (__isFrameworkException(error)) {
      return serializeFrameworkException(error, serdeContextBase);
    };
    return serializeFrameworkException(new __SerializationException(), serdeContextBase);
  }
  try {
    let validationFailures = validationFn(input);
    if (validationFailures && validationFailures.length > 0) {
      let validationException = validationCustomizer({ operation: operationName }, validationFailures);
      if (validationException) {
        return serializer.serializeError(validationException, serdeContextBase);
      }
    }
    let output = await operation(input, context);
    return serializer.serialize(output, serdeContextBase);
  } catch(error: unknown) {
    if (serializer.isOperationError(error)) {
      return serializer.serializeError(error, serdeContextBase);
    }
    console.log('Received an unexpected error', error);
    return serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
  }
}
export class GetItemHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<GetItemServerInput, GetItemServerOutput, Context>;
  private readonly mux: __Mux<"ExampleService", "GetItem">;
  private readonly serializer: __OperationSerializer<ExampleServiceService<Context>, "GetItem", GetItemErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"GetItem">;
  /**
   * Construct a GetItem handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for GetItem
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for GetItem that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<GetItemServerInput, GetItemServerOutput, Context>,
    mux: __Mux<"ExampleService", "GetItem">,
    serializer: __OperationSerializer<ExampleServiceService<Context>, "GetItem", GetItemErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"GetItem">
  ) {
    this.operation = operation;
    this.mux = mux;
    this.serializer = serializer;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(request: __HttpRequest, context: Context): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      console.log('Received a request that did not match com.example#ExampleService.GetItem. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "GetItem", this.serializer, this.operation, this.serializeFrameworkException, GetItemServerInput.validate, this.validationCustomizer);
  }
}
