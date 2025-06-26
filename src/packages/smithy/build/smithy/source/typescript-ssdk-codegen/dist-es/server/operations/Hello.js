import { HelloInput, } from "../../models/models_0";
import { deserializeHelloRequest, serializeFrameworkException, serializeHelloResponse, serializeInvalidInputErrorError, } from "../../protocols/Aws_restJson1";
import { InternalFailureException as __InternalFailureException, SerializationException as __SerializationException, isFrameworkException as __isFrameworkException, httpbinding, } from "@aws-smithy/server-common";
import { NodeHttpHandler, streamCollector, } from "@smithy/node-http-handler";
import { fromBase64, toBase64, } from "@smithy/util-base64";
import { fromUtf8, toUtf8, } from "@smithy/util-utf8";
export var HelloServerInput;
(function (HelloServerInput) {
    HelloServerInput.validate = HelloInput.validate;
})(HelloServerInput || (HelloServerInput = {}));
export class HelloSerializer {
    serialize = serializeHelloResponse;
    deserialize = deserializeHelloRequest;
    isOperationError(error) {
        const names = ["InvalidInputError"];
        return names.includes(error.name);
    }
    ;
    serializeError(error, ctx) {
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
export const getHelloHandler = (operation, customizer) => {
    const mux = new httpbinding.HttpBindingMux([
        new httpbinding.UriSpec('GET', [
            { type: 'path_literal', value: "hello" },
            { type: 'path' },
        ], [], { service: "HelloService", operation: "Hello" }),
    ]);
    return new HelloHandler(operation, mux, new HelloSerializer(), serializeFrameworkException, customizer);
};
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
export class HelloHandler {
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
            return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
        }
        return handle(request, context, "Hello", this.serializer, this.operation, this.serializeFrameworkException, HelloServerInput.validate, this.validationCustomizer);
    }
}
