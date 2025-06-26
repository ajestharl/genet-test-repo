import { ServiceException as __BaseException, ValidationFailure as __ValidationFailure } from "@aws-smithy/server-common";
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
/**
 * @public
 */
export interface HelloInput {
    name: string | undefined;
}
export declare namespace HelloInput {
    /**
     * @internal
     */
    const validate: (obj: HelloInput, path?: string) => __ValidationFailure[];
}
/**
 * @public
 */
export interface HelloOutput {
    message: string | undefined;
}
export declare namespace HelloOutput {
    /**
     * @internal
     */
    const validate: (obj: HelloOutput, path?: string) => __ValidationFailure[];
}
/**
 * @public
 */
export declare class InvalidInputError extends __BaseException {
    readonly name: "InvalidInputError";
    readonly $fault: "client";
    constructor(opts: __ExceptionOptionType<InvalidInputError, __BaseException>);
}
