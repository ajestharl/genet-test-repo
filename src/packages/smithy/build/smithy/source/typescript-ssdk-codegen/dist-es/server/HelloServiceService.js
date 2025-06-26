import { serializeFrameworkException } from "../protocols/Aws_restJson1";
import { HelloSerializer, HelloServerInput, } from "./operations/Hello";
import { InternalFailureException as __InternalFailureException, SerializationException as __SerializationException, UnknownOperationException as __UnknownOperationException, isFrameworkException as __isFrameworkException, httpbinding, } from "@aws-smithy/server-common";
import { NodeHttpHandler, streamCollector, } from "@smithy/node-http-handler";
import { fromBase64, toBase64, } from "@smithy/util-base64";
import { fromUtf8, toUtf8, } from "@smithy/util-utf8";
const serdeContextBase = {
    base64Encoder: toBase64,
    base64Decoder: fromBase64,
    utf8Encoder: toUtf8,
    utf8Decoder: fromUtf8,
    streamCollector: streamCollector,
    requestHandler: new NodeHttpHandler(),
    disableHostPrefix: true
};
async function handle(request, context, operationName, serializer, operation, serializeFrameworkException, validationFn, validationCustomizer) {
    let input;
    try {
        input = await serializer.deserialize(request, {
            endpoint: () => Promise.resolve(request), ...serdeContextBase
        });
    }
    catch (error) {
        if (__isFrameworkException(error)) {
            return serializeFrameworkException(error, serdeContextBase);
        }
        ;
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
    }
    catch (error) {
        if (serializer.isOperationError(error)) {
            return serializer.serializeError(error, serdeContextBase);
        }
        console.log('Received an unexpected error', error);
        return serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
}
export class HelloServiceServiceHandler {
    service;
    mux;
    serializerFactory;
    serializeFrameworkException;
    validationCustomizer;
    constructor(service, mux, serializerFactory, serializeFrameworkException, validationCustomizer) {
        this.service = service;
        this.mux = mux;
        this.serializerFactory = serializerFactory;
        this.serializeFrameworkException = serializeFrameworkException;
        this.validationCustomizer = validationCustomizer;
    }
    async handle(request, context) {
        const target = this.mux.match(request);
        if (target === undefined) {
            return this.serializeFrameworkException(new __UnknownOperationException(), serdeContextBase);
        }
        switch (target.operation) {
            case "Hello": {
                return handle(request, context, "Hello", this.serializerFactory("Hello"), this.service.Hello, this.serializeFrameworkException, HelloServerInput.validate, this.validationCustomizer);
            }
        }
    }
}
export const getHelloServiceServiceHandler = (service, customizer) => {
    const mux = new httpbinding.HttpBindingMux([
        new httpbinding.UriSpec('GET', [
            { type: 'path_literal', value: "hello" },
            { type: 'path' },
        ], [], { service: "HelloService", operation: "Hello" }),
    ]);
    const serFn = (op) => {
        switch (op) {
            case "Hello": return new HelloSerializer();
        }
    };
    return new HelloServiceServiceHandler(service, mux, serFn, serializeFrameworkException, customizer);
};
