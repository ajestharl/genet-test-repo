"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeInvalidInputErrorError = exports.serializeFrameworkException = exports.serializeHelloResponse = exports.deserializeHelloRequest = void 0;
const server_common_1 = require("@aws-smithy/server-common");
const protocol_http_1 = require("@smithy/protocol-http");
const smithy_client_1 = require("@smithy/smithy-client");
const util_body_length_node_1 = require("@smithy/util-body-length-node");
const deserializeHelloRequest = async (output, context) => {
    const contentTypeHeaderKey = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
    if (contentTypeHeaderKey != null) {
        const contentType = output.headers[contentTypeHeaderKey];
        if (contentType !== undefined && contentType !== "application/json") {
            throw new server_common_1.UnsupportedMediaTypeException();
        }
        ;
    }
    ;
    const acceptHeaderKey = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
    if (acceptHeaderKey != null) {
        const accept = output.headers[acceptHeaderKey];
        if (!(0, server_common_1.acceptMatches)(accept, "application/json")) {
            throw new server_common_1.NotAcceptableException();
        }
        ;
    }
    ;
    const contents = (0, smithy_client_1.map)({});
    const pathRegex = new RegExp("/hello/(?<name>[^/]+)");
    const parsedPath = output.path.match(pathRegex);
    if (parsedPath?.groups !== undefined) {
        contents.name = decodeURIComponent(parsedPath.groups.name);
    }
    await (0, smithy_client_1.collectBody)(output.body, context);
    return contents;
};
exports.deserializeHelloRequest = deserializeHelloRequest;
const serializeHelloResponse = async (input, ctx) => {
    const context = {
        ...ctx,
        endpoint: () => Promise.resolve({
            protocol: '',
            hostname: '',
            path: '',
        }),
    };
    let statusCode = 200;
    let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
        'content-type': 'application/json',
    });
    let body;
    body = JSON.stringify((0, smithy_client_1.take)(input, {
        'message': [],
    }));
    if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
        const length = (0, util_body_length_node_1.calculateBodyLength)(body);
        if (length !== undefined) {
            headers = { ...headers, 'content-length': String(length) };
        }
    }
    return new protocol_http_1.HttpResponse({
        headers,
        body,
        statusCode,
    });
};
exports.serializeHelloResponse = serializeHelloResponse;
const serializeFrameworkException = async (input, ctx) => {
    const context = {
        ...ctx,
        endpoint: () => Promise.resolve({
            protocol: '',
            hostname: '',
            path: '',
        }),
    };
    switch (input.name) {
        case "InternalFailure": {
            const statusCode = 500;
            let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
                'x-amzn-errortype': "InternalFailure",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new protocol_http_1.HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "NotAcceptableException": {
            const statusCode = 406;
            let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
                'x-amzn-errortype': "NotAcceptableException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new protocol_http_1.HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "SerializationException": {
            const statusCode = 400;
            let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
                'x-amzn-errortype': "SerializationException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new protocol_http_1.HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "UnknownOperationException": {
            const statusCode = 404;
            let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
                'x-amzn-errortype': "UnknownOperationException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new protocol_http_1.HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "UnsupportedMediaTypeException": {
            const statusCode = 415;
            let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
                'x-amzn-errortype': "UnsupportedMediaTypeException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new protocol_http_1.HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
    }
};
exports.serializeFrameworkException = serializeFrameworkException;
const serializeInvalidInputErrorError = async (input, ctx) => {
    const context = {
        ...ctx,
        endpoint: () => Promise.resolve({
            protocol: '',
            hostname: '',
            path: '',
        }),
    };
    const statusCode = 400;
    let headers = (0, smithy_client_1.map)({}, smithy_client_1.isSerializableHeaderValue, {
        'x-amzn-errortype': "InvalidInputError",
        'content-type': 'application/json',
    });
    let body;
    body = JSON.stringify((0, smithy_client_1.take)(input, {
        'message': [],
    }));
    return new protocol_http_1.HttpResponse({
        headers,
        body,
        statusCode,
    });
};
exports.serializeInvalidInputErrorError = serializeInvalidInputErrorError;
const deserializeMetadata = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"],
});
const collectBodyString = (streamBody, context) => (0, smithy_client_1.collectBody)(streamBody, context).then(body => context.utf8Encoder(body));
