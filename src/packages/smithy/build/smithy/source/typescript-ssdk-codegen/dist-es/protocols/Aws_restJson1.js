import { NotAcceptableException as __NotAcceptableException, UnsupportedMediaTypeException as __UnsupportedMediaTypeException, acceptMatches as __acceptMatches, } from "@aws-smithy/server-common";
import { HttpResponse as __HttpResponse, } from "@smithy/protocol-http";
import { collectBody, isSerializableHeaderValue, map, take, } from "@smithy/smithy-client";
import { calculateBodyLength } from "@smithy/util-body-length-node";
export const deserializeHelloRequest = async (output, context) => {
    const contentTypeHeaderKey = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
    if (contentTypeHeaderKey != null) {
        const contentType = output.headers[contentTypeHeaderKey];
        if (contentType !== undefined && contentType !== "application/json") {
            throw new __UnsupportedMediaTypeException();
        }
        ;
    }
    ;
    const acceptHeaderKey = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
    if (acceptHeaderKey != null) {
        const accept = output.headers[acceptHeaderKey];
        if (!__acceptMatches(accept, "application/json")) {
            throw new __NotAcceptableException();
        }
        ;
    }
    ;
    const contents = map({});
    const pathRegex = new RegExp("/hello/(?<name>[^/]+)");
    const parsedPath = output.path.match(pathRegex);
    if (parsedPath?.groups !== undefined) {
        contents.name = decodeURIComponent(parsedPath.groups.name);
    }
    await collectBody(output.body, context);
    return contents;
};
export const serializeHelloResponse = async (input, ctx) => {
    const context = {
        ...ctx,
        endpoint: () => Promise.resolve({
            protocol: '',
            hostname: '',
            path: '',
        }),
    };
    let statusCode = 200;
    let headers = map({}, isSerializableHeaderValue, {
        'content-type': 'application/json',
    });
    let body;
    body = JSON.stringify(take(input, {
        'message': [],
    }));
    if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
        const length = calculateBodyLength(body);
        if (length !== undefined) {
            headers = { ...headers, 'content-length': String(length) };
        }
    }
    return new __HttpResponse({
        headers,
        body,
        statusCode,
    });
};
export const serializeFrameworkException = async (input, ctx) => {
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
            let headers = map({}, isSerializableHeaderValue, {
                'x-amzn-errortype': "InternalFailure",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new __HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "NotAcceptableException": {
            const statusCode = 406;
            let headers = map({}, isSerializableHeaderValue, {
                'x-amzn-errortype': "NotAcceptableException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new __HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "SerializationException": {
            const statusCode = 400;
            let headers = map({}, isSerializableHeaderValue, {
                'x-amzn-errortype': "SerializationException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new __HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "UnknownOperationException": {
            const statusCode = 404;
            let headers = map({}, isSerializableHeaderValue, {
                'x-amzn-errortype': "UnknownOperationException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new __HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
        case "UnsupportedMediaTypeException": {
            const statusCode = 415;
            let headers = map({}, isSerializableHeaderValue, {
                'x-amzn-errortype': "UnsupportedMediaTypeException",
                'content-type': 'application/json',
            });
            let body;
            body = "{}";
            return new __HttpResponse({
                headers,
                body,
                statusCode,
            });
        }
    }
};
export const serializeInvalidInputErrorError = async (input, ctx) => {
    const context = {
        ...ctx,
        endpoint: () => Promise.resolve({
            protocol: '',
            hostname: '',
            path: '',
        }),
    };
    const statusCode = 400;
    let headers = map({}, isSerializableHeaderValue, {
        'x-amzn-errortype': "InvalidInputError",
        'content-type': 'application/json',
    });
    let body;
    body = JSON.stringify(take(input, {
        'message': [],
    }));
    return new __HttpResponse({
        headers,
        body,
        statusCode,
    });
};
const deserializeMetadata = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"],
});
const collectBodyString = (streamBody, context) => collectBody(streamBody, context).then(body => context.utf8Encoder(body));
