// @ts-nocheck
// smithy-typescript generated code
import {
  HandlerExecutionContext,
  HttpAuthOption,
  HttpAuthScheme,
  HttpAuthSchemeParameters,
  HttpAuthSchemeParametersProvider,
  HttpAuthSchemeProvider,
} from "@smithy/types";
import { getSmithyContext } from "@smithy/util-middleware";
import { ExampleClientResolvedConfig } from "../ExampleClient";

/**
 * @internal
 */
export interface ExampleHttpAuthSchemeParameters
  extends HttpAuthSchemeParameters {}

/**
 * @internal
 */
export interface ExampleHttpAuthSchemeParametersProvider
  extends HttpAuthSchemeParametersProvider<
    ExampleClientResolvedConfig,
    HandlerExecutionContext,
    ExampleHttpAuthSchemeParameters,
    object
  > {}

/**
 * @internal
 */
export const defaultExampleHttpAuthSchemeParametersProvider = async (
  config: ExampleClientResolvedConfig,
  context: HandlerExecutionContext,
  input: object,
): Promise<ExampleHttpAuthSchemeParameters> => {
  return {
    operation: getSmithyContext(context).operation as string,
  };
};

function createSmithyApiNoAuthHttpAuthOption(
  authParameters: ExampleHttpAuthSchemeParameters,
): HttpAuthOption {
  return {
    schemeId: "smithy.api#noAuth",
  };
}

/**
 * @internal
 */
export interface ExampleHttpAuthSchemeProvider
  extends HttpAuthSchemeProvider<ExampleHttpAuthSchemeParameters> {}

/**
 * @internal
 */
export const defaultExampleHttpAuthSchemeProvider: ExampleHttpAuthSchemeProvider =
  (authParameters) => {
    const options: HttpAuthOption[] = [];
    switch (authParameters.operation) {
      default: {
        options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
      }
    }
    return options;
  };

/**
 * @internal
 */
export interface HttpAuthSchemeInputConfig {
  /**
   * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
   * @internal
   */
  httpAuthSchemes?: HttpAuthScheme[];

  /**
   * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
   * @internal
   */
  httpAuthSchemeProvider?: ExampleHttpAuthSchemeProvider;
}

/**
 * @internal
 */
export interface HttpAuthSchemeResolvedConfig {
  /**
   * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
   * @internal
   */
  readonly httpAuthSchemes: HttpAuthScheme[];

  /**
   * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
   * @internal
   */
  readonly httpAuthSchemeProvider: ExampleHttpAuthSchemeProvider;
}

/**
 * @internal
 */
export const resolveHttpAuthSchemeConfig = <T>(
  config: T & HttpAuthSchemeInputConfig,
): T & HttpAuthSchemeResolvedConfig => {
  return Object.assign(config, {}) as T & HttpAuthSchemeResolvedConfig;
};
