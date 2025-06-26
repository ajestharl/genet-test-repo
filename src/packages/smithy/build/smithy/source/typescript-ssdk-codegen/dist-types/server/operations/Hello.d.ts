import { HelloInput, HelloOutput, InvalidInputError } from "../../models/models_0";
import { HelloServiceService } from "../HelloServiceService";
import { ServerSerdeContext, Mux as __Mux, Operation as __Operation, OperationSerializer as __OperationSerializer, ServerSerdeContext as __ServerSerdeContext, ServiceHandler as __ServiceHandler, SmithyFrameworkException as __SmithyFrameworkException, ValidationCustomizer as __ValidationCustomizer, ValidationFailure as __ValidationFailure } from "@aws-smithy/server-common";
import { HttpRequest as __HttpRequest, HttpResponse as __HttpResponse } from "@smithy/protocol-http";
export type Hello<Context> = __Operation<HelloServerInput, HelloServerOutput, Context>;
export interface HelloServerInput extends HelloInput {
}
export declare namespace HelloServerInput {
    /**
     * @internal
     */
    const validate: (obj: Parameters<typeof HelloInput.validate>[0]) => __ValidationFailure[];
}
export interface HelloServerOutput extends HelloOutput {
}
export type HelloErrors = InvalidInputError;
export declare class HelloSerializer implements __OperationSerializer<HelloServiceService<any>, "Hello", HelloErrors> {
    serialize: (input: HelloServerOutput, ctx: ServerSerdeContext) => Promise<__HttpResponse>;
    deserialize: (output: __HttpRequest, context: import("@smithy/types").SerdeContext) => Promise<HelloServerInput>;
    isOperationError(error: any): error is HelloErrors;
    serializeError(error: HelloErrors, ctx: ServerSerdeContext): Promise<__HttpResponse>;
}
export declare const getHelloHandler: <Context>(operation: __Operation<HelloServerInput, HelloServerOutput, Context>, customizer: __ValidationCustomizer<"Hello">) => __ServiceHandler<Context, __HttpRequest, __HttpResponse>;
export declare class HelloHandler<Context> implements __ServiceHandler<Context> {
    private readonly operation;
    private readonly mux;
    private readonly serializer;
    private readonly serializeFrameworkException;
    private readonly validationCustomizer;
    /**
     * Construct a Hello handler.
     * @param operation The {@link __Operation} implementation that supplies the business logic for Hello
     * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
     * @param serializer An {@link __OperationSerializer} for Hello that
     *                   handles deserialization of requests and serialization of responses
     * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
     * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
     */
    constructor(operation: __Operation<HelloServerInput, HelloServerOutput, Context>, mux: __Mux<"HelloService", "Hello">, serializer: __OperationSerializer<HelloServiceService<Context>, "Hello", HelloErrors>, serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>, validationCustomizer: __ValidationCustomizer<"Hello">);
    handle(request: __HttpRequest, context: Context): Promise<__HttpResponse>;
}
