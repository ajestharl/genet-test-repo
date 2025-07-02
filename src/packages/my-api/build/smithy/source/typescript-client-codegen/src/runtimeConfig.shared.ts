// @ts-nocheck
// smithy-typescript generated code
import { NoAuthSigner } from "@smithy/core";
import { NoOpLogger } from "@smithy/smithy-client";
import { IdentityProviderConfig } from "@smithy/types";
import { parseUrl } from "@smithy/url-parser";
import { fromBase64, toBase64 } from "@smithy/util-base64";
import { fromUtf8, toUtf8 } from "@smithy/util-utf8";
import { defaultExampleHttpAuthSchemeProvider } from "./auth/httpAuthSchemeProvider";
import { defaultRegionInfoProvider } from "./endpoints";
import { ExampleClientConfig } from "./ExampleClient";

/**
 * @internal
 */
export const getRuntimeConfig = (config: ExampleClientConfig) => {
  return {
    apiVersion: "2023-01-01",
    base64Decoder: config?.base64Decoder ?? fromBase64,
    base64Encoder: config?.base64Encoder ?? toBase64,
    disableHostPrefix: config?.disableHostPrefix ?? false,
    extensions: config?.extensions ?? [],
    httpAuthSchemeProvider:
      config?.httpAuthSchemeProvider ?? defaultExampleHttpAuthSchemeProvider,
    httpAuthSchemes: config?.httpAuthSchemes ?? [
      {
        schemeId: "smithy.api#noAuth",
        identityProvider: (ipc: IdentityProviderConfig) =>
          ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
        signer: new NoAuthSigner(),
      },
    ],
    logger: config?.logger ?? new NoOpLogger(),
    regionInfoProvider: config?.regionInfoProvider ?? defaultRegionInfoProvider,
    serviceId: config?.serviceId ?? "Example",
    urlParser: config?.urlParser ?? parseUrl,
    utf8Decoder: config?.utf8Decoder ?? fromUtf8,
    utf8Encoder: config?.utf8Encoder ?? toUtf8,
  };
};
