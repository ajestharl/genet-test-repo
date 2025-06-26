// @ts-nocheck
// smithy-typescript generated code
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
import { HelloServiceException as __BaseException } from "./HelloServiceException";

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
export class InvalidInputError extends __BaseException {
  readonly name: "InvalidInputError" = "InvalidInputError";
  readonly $fault: "client" = "client";
  /**
   * @internal
   */
  constructor(opts: __ExceptionOptionType<InvalidInputError, __BaseException>) {
    super({
      name: "InvalidInputError",
      $fault: "client",
      ...opts,
    });
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
}
