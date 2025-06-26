"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelloServiceServiceHandler = exports.HelloServiceServiceHandler = void 0;
const Aws_restJson1_1 = require("../protocols/Aws_restJson1");
const Hello_1 = require("./operations/Hello");
const server_common_1 = require("@aws-smithy/server-common");
const node_http_handler_1 = require("@smithy/node-http-handler");
const util_base64_1 = require("@smithy/util-base64");
const util_utf8_1 = require("@smithy/util-utf8");
const serdeContextBase = {
    base64Encoder: util_base64_1.toBase64,
    base64Decoder: util_base64_1.fromBase64,
    utf8Encoder: util_utf8_1.toUtf8,
    utf8Decoder: util_utf8_1.fromUtf8,
    streamCollector: node_http_handler_1.streamCollector,
    requestHandler: new node_http_handler_1.NodeHttpHandler(),
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
        if ((0, server_common_1.isFrameworkException)(error)) {
            return serializeFrameworkException(error, serdeContextBase);
        }
        ;
        return serializeFrameworkException(new server_common_1.SerializationException(), serdeContextBase);
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
        return serializeFrameworkException(new server_common_1.InternalFailureException(), serdeContextBase);
    }
}
class HelloServiceServiceHandler {
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
            return this.serializeFrameworkException(new server_common_1.UnknownOperationException(), serdeContextBase);
        }
        switch (target.operation) {
            case "Hello": {
                return handle(request, context, "Hello", this.serializerFactory("Hello"), this.service.Hello, this.serializeFrameworkException, Hello_1.HelloServerInput.validate, this.validationCustomizer);
            }
        }
    }
}
exports.HelloServiceServiceHandler = HelloServiceServiceHandler;
const getHelloServiceServiceHandler = (service, customizer) => {
    const mux = new server_common_1.httpbinding.HttpBindingMux([
        new server_common_1.httpbinding.UriSpec('GET', [
            { type: 'path_literal', value: "hello" },
            { type: 'path' },
        ], [], { service: "HelloService", operation: "Hello" }),
    ]);
    const serFn = (op) => {
        switch (op) {
            case "Hello": return new Hello_1.HelloSerializer();
        }
    };
    return new HelloServiceServiceHandler(service, mux, serFn, Aws_restJson1_1.serializeFrameworkException, customizer);
};
exports.getHelloServiceServiceHandler = getHelloServiceServiceHandler;
