import { HelloServiceException as __BaseException } from "./HelloServiceException";
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
/**
 * @public
 */
export interface HelloInput {
    name: string | undefined;
}
/**
 * @public
 */
export interface HelloOutput {
    message: string | undefined;
}
/**
 * @public
 */
export declare class InvalidInputError extends __BaseException {
    readonly name: "InvalidInputError";
    readonly $fault: "client";
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<InvalidInputError, __BaseException>);
}
