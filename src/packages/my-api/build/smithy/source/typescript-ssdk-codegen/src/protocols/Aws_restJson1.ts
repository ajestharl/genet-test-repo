// @ts-nocheck
// smithy-typescript generated code
import {
  loadRestJsonErrorCode,
  parseJsonBody as parseBody,
  parseJsonErrorBody as parseErrorBody,
} from "@aws-sdk/core";
import {
  ServerSerdeContext,
  ServiceException as __BaseException,
  NotAcceptableException as __NotAcceptableException,
  SmithyFrameworkException as __SmithyFrameworkException,
  UnsupportedMediaTypeException as __UnsupportedMediaTypeException,
  acceptMatches as __acceptMatches,
} from "@aws-smithy/server-common";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@smithy/protocol-http";
import {
  _json,
  collectBody,
  isSerializableHeaderValue,
  map,
  take,
} from "@smithy/smithy-client";
import {
  Endpoint as __Endpoint,
  ResponseMetadata as __ResponseMetadata,
  SerdeContext as __SerdeContext,
} from "@smithy/types";
import { calculateBodyLength } from "@smithy/util-body-length-node";
import { ValidationException } from "../models/models_0";
import {
  GetItemServerInput,
  GetItemServerOutput,
} from "../server/operations/GetItem";

export const deserializeGetItemRequest = async (
  output: __HttpRequest,
  context: __SerdeContext,
): Promise<GetItemServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(
    output.headers,
  ).find((key) => key.toLowerCase() === "content-type");
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    }
  }
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(
    (key) => key.toLowerCase() === "accept",
  );
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    }
  }
  const contents: any = map({});
  const pathRegex = new RegExp("/items/(?<id>[^/]+)");
  const parsedPath = output.path.match(pathRegex);
  if (parsedPath?.groups !== undefined) {
    contents.id = decodeURIComponent(parsedPath.groups.id);
  }
  await collectBody(output.body, context);
  return contents;
};

export const serializeGetItemResponse = async (
  input: GetItemServerOutput,
  ctx: ServerSerdeContext,
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () =>
      Promise.resolve({
        protocol: "",
        hostname: "",
        path: "",
      }),
  };
  let statusCode: number = 200;
  let headers: any = map({}, isSerializableHeaderValue, {
    "content-type": "application/json",
  });
  let body: any;
  body = JSON.stringify(
    take(input, {
      name: [],
    }),
  );
  if (
    body &&
    Object.keys(headers)
      .map((str) => str.toLowerCase())
      .indexOf("content-length") === -1
  ) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, "content-length": String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
};

export const serializeFrameworkException = async (
  input: __SmithyFrameworkException,
  ctx: ServerSerdeContext,
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () =>
      Promise.resolve({
        protocol: "",
        hostname: "",
        path: "",
      }),
  };
  switch (input.name) {
    case "InternalFailure": {
      const statusCode: number = 500;
      let headers: any = map({}, isSerializableHeaderValue, {
        "x-amzn-errortype": "InternalFailure",
        "content-type": "application/json",
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "NotAcceptableException": {
      const statusCode: number = 406;
      let headers: any = map({}, isSerializableHeaderValue, {
        "x-amzn-errortype": "NotAcceptableException",
        "content-type": "application/json",
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "SerializationException": {
      const statusCode: number = 400;
      let headers: any = map({}, isSerializableHeaderValue, {
        "x-amzn-errortype": "SerializationException",
        "content-type": "application/json",
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "UnknownOperationException": {
      const statusCode: number = 404;
      let headers: any = map({}, isSerializableHeaderValue, {
        "x-amzn-errortype": "UnknownOperationException",
        "content-type": "application/json",
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "UnsupportedMediaTypeException": {
      const statusCode: number = 415;
      let headers: any = map({}, isSerializableHeaderValue, {
        "x-amzn-errortype": "UnsupportedMediaTypeException",
        "content-type": "application/json",
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
  }
};

export const serializeValidationExceptionError = async (
  input: ValidationException,
  ctx: ServerSerdeContext,
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () =>
      Promise.resolve({
        protocol: "",
        hostname: "",
        path: "",
      }),
  };
  const statusCode: number = 400;
  let headers: any = map({}, isSerializableHeaderValue, {
    "x-amzn-errortype": "ValidationException",
    "content-type": "application/json",
  });
  let body: any;
  body = JSON.stringify(
    take(input, {
      message: [],
    }),
  );
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
};

const deserializeMetadata = (output: __HttpResponse): __ResponseMetadata => ({
  httpStatusCode: output.statusCode,
  requestId:
    output.headers["x-amzn-requestid"] ??
    output.headers["x-amzn-request-id"] ??
    output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"],
});

// Encode Uint8Array data into string with utf-8.
const collectBodyString = (
  streamBody: any,
  context: __SerdeContext,
): Promise<string> =>
  collectBody(streamBody, context).then((body) => context.utf8Encoder(body));
