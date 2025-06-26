"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.de_HelloCommand = exports.se_HelloCommand = void 0;
const HelloServiceException_1 = require("../models/HelloServiceException");
const models_0_1 = require("../models/models_0");
const core_1 = require("@aws-sdk/core");
const core_2 = require("@smithy/core");
const smithy_client_1 = require("@smithy/smithy-client");
const se_HelloCommand = async (input, context) => {
    const b = (0, core_2.requestBuilder)(input, context);
    const headers = {};
    b.bp("/hello/{name}");
    b.p('name', () => input.name, '{name}', false);
    let body;
    b.m("GET")
        .h(headers)
        .b(body);
    return b.build();
};
exports.se_HelloCommand = se_HelloCommand;
const de_HelloCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return de_CommandError(output, context);
    }
    const contents = (0, smithy_client_1.map)({
        $metadata: deserializeMetadata(output),
    });
    const data = (0, smithy_client_1.expectNonNull)(((0, smithy_client_1.expectObject)(await (0, core_1.parseJsonBody)(output.body, context))), "body");
    const doc = (0, smithy_client_1.take)(data, {
        'message': smithy_client_1.expectString,
    });
    Object.assign(contents, doc);
    return contents;
};
exports.de_HelloCommand = de_HelloCommand;
const de_CommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await (0, core_1.parseJsonErrorBody)(output.body, context)
    };
    const errorCode = (0, core_1.loadRestJsonErrorCode)(output, parsedOutput.body);
    switch (errorCode) {
        case "InvalidInputError":
        case "example.hello#InvalidInputError":
            throw await de_InvalidInputErrorRes(parsedOutput, context);
        default:
            const parsedBody = parsedOutput.body;
            return throwDefaultError({
                output,
                parsedBody,
                errorCode
            });
    }
};
const throwDefaultError = (0, smithy_client_1.withBaseException)(HelloServiceException_1.HelloServiceException);
const de_InvalidInputErrorRes = async (parsedOutput, context) => {
    const contents = (0, smithy_client_1.map)({});
    const data = parsedOutput.body;
    const doc = (0, smithy_client_1.take)(data, {
        'message': smithy_client_1.expectString,
    });
    Object.assign(contents, doc);
    const exception = new models_0_1.InvalidInputError({
        $metadata: deserializeMetadata(parsedOutput),
        ...contents
    });
    return (0, smithy_client_1.decorateServiceException)(exception, parsedOutput.body);
};
const deserializeMetadata = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"],
});
const collectBodyString = (streamBody, context) => (0, smithy_client_1.collectBody)(streamBody, context).then(body => context.utf8Encoder(body));
