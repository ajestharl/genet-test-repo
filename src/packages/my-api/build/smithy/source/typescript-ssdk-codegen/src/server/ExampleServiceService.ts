/* eslint-disable */
// @ts-nocheck
// smithy-typescript generated code
import { serializeFrameworkException } from "../protocols/Aws_restJson1";
import {
  GetItem,
  GetItemSerializer,
  GetItemServerInput,
} from "./operations/GetItem";
import {
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
  UnknownOperationException as __UnknownOperationException,
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

export type ExampleServiceServiceOperations = "GetItem";
export interface ExampleServiceService<Context> {
  GetItem: GetItem<Context>
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
export class ExampleServiceServiceHandler<Context> implements __ServiceHandler<Context> {
  private readonly service: ExampleServiceService<Context>;
  private readonly mux: __Mux<"ExampleService", ExampleServiceServiceOperations>;
  private readonly serializerFactory: <T extends ExampleServiceServiceOperations>(operation: T) => __OperationSerializer<ExampleServiceService<Context>, T, __ServiceException>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<ExampleServiceServiceOperations>;
  /**
   * Construct a ExampleServiceService handler.
   * @param service The {@link ExampleServiceService} implementation that supplies the business logic for ExampleServiceService
   * @param mux The {@link __Mux} that determines which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializerFactory A factory for an {@link __OperationSerializer} for each operation in ExampleServiceService that
   *                          handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    service: ExampleServiceService<Context>,
    mux: __Mux<"ExampleService", ExampleServiceServiceOperations>,
    serializerFactory:<T extends ExampleServiceServiceOperations>(op: T) => __OperationSerializer<ExampleServiceService<Context>, T, __ServiceException>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<ExampleServiceServiceOperations>
  ) {
    this.service = service;
    this.mux = mux;
    this.serializerFactory = serializerFactory;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(request: __HttpRequest, context: Context): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      return this.serializeFrameworkException(new __UnknownOperationException(), serdeContextBase);
    }
    switch (target.operation) {
      case "GetItem" : {
        return handle(request, context, "GetItem", this.serializerFactory("GetItem"), this.service.GetItem, this.serializeFrameworkException, GetItemServerInput.validate, this.validationCustomizer);
      }
    }
  }
}

export const getExampleServiceServiceHandler = <Context>(service: ExampleServiceService<Context>, customizer: __ValidationCustomizer<ExampleServiceServiceOperations>): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"ExampleService", keyof ExampleServiceService<Context>>([
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
  const serFn: (op: ExampleServiceServiceOperations) => __OperationSerializer<ExampleServiceService<Context>, ExampleServiceServiceOperations, __ServiceException> = (op) => {
    switch (op) {
      case "GetItem": return new GetItemSerializer();
    }
  };
  return new ExampleServiceServiceHandler(service, mux, serFn, serializeFrameworkException, customizer);
}
