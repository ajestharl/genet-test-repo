import { Hello } from "./operations/Hello";
import { Mux as __Mux, OperationSerializer as __OperationSerializer, ServerSerdeContext as __ServerSerdeContext, ServiceException as __ServiceException, ServiceHandler as __ServiceHandler, SmithyFrameworkException as __SmithyFrameworkException, ValidationCustomizer as __ValidationCustomizer } from "@aws-smithy/server-common";
import { HttpRequest as __HttpRequest, HttpResponse as __HttpResponse } from "@smithy/protocol-http";
export type HelloServiceServiceOperations = "Hello";
export interface HelloServiceService<Context> {
    Hello: Hello<Context>;
}
export declare class HelloServiceServiceHandler<Context> implements __ServiceHandler<Context> {
    private readonly service;
    private readonly mux;
    private readonly serializerFactory;
    private readonly serializeFrameworkException;
    private readonly validationCustomizer;
    /**
     * Construct a HelloServiceService handler.
     * @param service The {@link HelloServiceService} implementation that supplies the business logic for HelloServiceService
     * @param mux The {@link __Mux} that determines which service and operation are being invoked by a given {@link __HttpRequest}
     * @param serializerFactory A factory for an {@link __OperationSerializer} for each operation in HelloServiceService that
     *                          handles deserialization of requests and serialization of responses
     * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
     * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
     */
    constructor(service: HelloServiceService<Context>, mux: __Mux<"HelloService", HelloServiceServiceOperations>, serializerFactory: <T extends HelloServiceServiceOperations>(op: T) => __OperationSerializer<HelloServiceService<Context>, T, __ServiceException>, serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>, validationCustomizer: __ValidationCustomizer<HelloServiceServiceOperations>);
    handle(request: __HttpRequest, context: Context): Promise<__HttpResponse>;
}
export declare const getHelloServiceServiceHandler: <Context>(service: HelloServiceService<Context>, customizer: __ValidationCustomizer<HelloServiceServiceOperations>) => __ServiceHandler<Context, __HttpRequest, __HttpResponse>;
