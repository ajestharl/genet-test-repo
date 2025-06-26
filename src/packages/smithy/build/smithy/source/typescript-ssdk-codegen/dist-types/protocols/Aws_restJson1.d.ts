import { InvalidInputError } from "../models/models_0";
import { HelloServerInput, HelloServerOutput } from "../server/operations/Hello";
import { ServerSerdeContext, SmithyFrameworkException as __SmithyFrameworkException } from "@aws-smithy/server-common";
import { HttpRequest as __HttpRequest, HttpResponse as __HttpResponse } from "@smithy/protocol-http";
import { SerdeContext as __SerdeContext } from "@smithy/types";
export declare const deserializeHelloRequest: (output: __HttpRequest, context: __SerdeContext) => Promise<HelloServerInput>;
export declare const serializeHelloResponse: (input: HelloServerOutput, ctx: ServerSerdeContext) => Promise<__HttpResponse>;
export declare const serializeFrameworkException: (input: __SmithyFrameworkException, ctx: ServerSerdeContext) => Promise<__HttpResponse>;
export declare const serializeInvalidInputErrorError: (input: InvalidInputError, ctx: ServerSerdeContext) => Promise<__HttpResponse>;
