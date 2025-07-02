// @ts-nocheck
// smithy-typescript generated code
import { HttpAuthScheme } from "@smithy/types";
import { ExampleHttpAuthSchemeProvider } from "./httpAuthSchemeProvider";

/**
 * @internal
 */
export interface HttpAuthExtensionConfiguration {
  setHttpAuthScheme(httpAuthScheme: HttpAuthScheme): void;
  httpAuthSchemes(): HttpAuthScheme[];
  setHttpAuthSchemeProvider(
    httpAuthSchemeProvider: ExampleHttpAuthSchemeProvider,
  ): void;
  httpAuthSchemeProvider(): ExampleHttpAuthSchemeProvider;
}

/**
 * @internal
 */
export type HttpAuthRuntimeConfig = Partial<{
  httpAuthSchemes: HttpAuthScheme[];
  httpAuthSchemeProvider: ExampleHttpAuthSchemeProvider;
}>;

/**
 * @internal
 */
export const getHttpAuthExtensionConfiguration = (
  runtimeConfig: HttpAuthRuntimeConfig,
): HttpAuthExtensionConfiguration => {
  let _httpAuthSchemes = runtimeConfig.httpAuthSchemes!;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider!;
  return {
    setHttpAuthScheme(httpAuthScheme: HttpAuthScheme): void {
      const index = _httpAuthSchemes.findIndex(
        (scheme) => scheme.schemeId === httpAuthScheme.schemeId,
      );
      if (index === -1) {
        _httpAuthSchemes.push(httpAuthScheme);
      } else {
        _httpAuthSchemes.splice(index, 1, httpAuthScheme);
      }
    },
    httpAuthSchemes(): HttpAuthScheme[] {
      return _httpAuthSchemes;
    },
    setHttpAuthSchemeProvider(
      httpAuthSchemeProvider: ExampleHttpAuthSchemeProvider,
    ): void {
      _httpAuthSchemeProvider = httpAuthSchemeProvider;
    },
    httpAuthSchemeProvider(): ExampleHttpAuthSchemeProvider {
      return _httpAuthSchemeProvider;
    },
  };
};

/**
 * @internal
 */
export const resolveHttpAuthRuntimeConfig = (
  config: HttpAuthExtensionConfiguration,
): HttpAuthRuntimeConfig => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
  };
};
