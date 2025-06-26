"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloHandler = exports.getHelloHandler = exports.HelloSerializer = exports.HelloServerInput = void 0;
const models_0_1 = require("../../models/models_0");
const Aws_restJson1_1 = require("../../protocols/Aws_restJson1");
const server_common_1 = require("@aws-smithy/server-common");
const node_http_handler_1 = require("@smithy/node-http-handler");
const util_base64_1 = require("@smithy/util-base64");
const util_utf8_1 = require("@smithy/util-utf8");
var HelloServerInput;
(function (HelloServerInput) {
    HelloServerInput.validate = models_0_1.HelloInput.validate;
})(HelloServerInput || (exports.HelloServerInput = HelloServerInput = {}));
class HelloSerializer {
    serialize = Aws_restJson1_1.serializeHelloResponse;
    deserialize = Aws_restJson1_1.deserializeHelloRequest;
    isOperationError(error) {
        const names = ["InvalidInputError"];
        return names.includes(error.name);
    }
    ;
    serializeError(error, ctx) {
        switch (error.name) {
            case "InvalidInputError": {
                return (0, Aws_restJson1_1.serializeInvalidInputErrorError)(error, ctx);
            }
            default: {
                throw error;
            }
        }
    }
}
exports.HelloSerializer = HelloSerializer;
const getHelloHandler = (operation, customizer) => {
    const mux = new server_common_1.httpbinding.HttpBindingMux([
        new server_common_1.httpbinding.UriSpec('GET', [
            { type: 'path_literal', value: "hello" },
            { type: 'path' },
        ], [], { service: "HelloService", operation: "Hello" }),
    ]);
    return new HelloHandler(operation, mux, new HelloSerializer(), Aws_restJson1_1.serializeFrameworkException, customizer);
};
exports.getHelloHandler = getHelloHandler;
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
class HelloHandler {
    operation;
    mux;
    serializer;
    serializeFrameworkException;
    validationCustomizer;
    constructor(operation, mux, serializer, serializeFrameworkException, validationCustomizer) {
        this.operation = operation;
        this.mux = mux;
        this.serializer = serializer;
        this.serializeFrameworkException = serializeFrameworkException;
        this.validationCustomizer = validationCustomizer;
    }
    async handle(request, context) {
        const target = this.mux.match(request);
        if (target === undefined) {
            console.log('Received a request that did not match example.hello#HelloService.Hello. This indicates a misconfiguration.');
            return this.serializeFrameworkException(new server_common_1.InternalFailureException(), serdeContextBase);
        }
        return handle(request, context, "Hello", this.serializer, this.operation, this.serializeFrameworkException, HelloServerInput.validate, this.validationCustomizer);
    }
}
exports.HelloHandler = HelloHandler;
