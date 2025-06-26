import { HelloClientResolvedConfig } from "../HelloClient";
import { HandlerExecutionContext, HttpAuthScheme, HttpAuthSchemeParameters, HttpAuthSchemeParametersProvider, HttpAuthSchemeProvider, Provider } from "@smithy/types";
/**
 * @internal
 */
export interface HelloHttpAuthSchemeParameters extends HttpAuthSchemeParameters {
}
/**
 * @internal
 */
export interface HelloHttpAuthSchemeParametersProvider extends HttpAuthSchemeParametersProvider<HelloClientResolvedConfig, HandlerExecutionContext, HelloHttpAuthSchemeParameters, object> {
}
/**
 * @internal
 */
export declare const defaultHelloHttpAuthSchemeParametersProvider: (config: HelloClientResolvedConfig, context: HandlerExecutionContext, input: object) => Promise<HelloHttpAuthSchemeParameters>;
/**
 * @internal
 */
export interface HelloHttpAuthSchemeProvider extends HttpAuthSchemeProvider<HelloHttpAuthSchemeParameters> {
}
/**
 * @internal
 */
export declare const defaultHelloHttpAuthSchemeProvider: HelloHttpAuthSchemeProvider;
/**
 * @internal
 */
export interface HttpAuthSchemeInputConfig {
    /**
     * A comma-separated list of case-sensitive auth scheme names.
     * An auth scheme name is a fully qualified auth scheme ID with the namespace prefix trimmed.
     * For example, the auth scheme with ID aws.auth#sigv4 is named sigv4.
     * @public
     */
    authSchemePreference?: string[] | Provider<string[]>;
    /**
     * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
     * @internal
     */
    httpAuthSchemes?: HttpAuthScheme[];
    /**
     * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
     * @internal
     */
    httpAuthSchemeProvider?: HelloHttpAuthSchemeProvider;
}
/**
 * @internal
 */
export interface HttpAuthSchemeResolvedConfig {
    /**
     * A comma-separated list of case-sensitive auth scheme names.
     * An auth scheme name is a fully qualified auth scheme ID with the namespace prefix trimmed.
     * For example, the auth scheme with ID aws.auth#sigv4 is named sigv4.
     * @public
     */
    readonly authSchemePreference: Provider<string[]>;
    /**
     * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
     * @internal
     */
    readonly httpAuthSchemes: HttpAuthScheme[];
    /**
     * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
     * @internal
     */
    readonly httpAuthSchemeProvider: HelloHttpAuthSchemeProvider;
}
/**
 * @internal
 */
export declare const resolveHttpAuthSchemeConfig: <T>(config: T & HttpAuthSchemeInputConfig) => T & HttpAuthSchemeResolvedConfig;
