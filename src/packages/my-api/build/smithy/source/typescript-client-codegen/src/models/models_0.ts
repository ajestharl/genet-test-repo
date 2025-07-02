// @ts-nocheck
// smithy-typescript generated code
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
import { ExampleServiceException as __BaseException } from "./ExampleServiceException";

/**
 * @public
 */
export interface GetItemInput {
  id: string | undefined;
}

/**
 * @public
 */
export interface GetItemOutput {
  name: string | undefined;
}

/**
 * @public
 */
export class ValidationException extends __BaseException {
  readonly name: "ValidationException" = "ValidationException";
  readonly $fault: "client" = "client";
  /**
   * @internal
   */
  constructor(
    opts: __ExceptionOptionType<ValidationException, __BaseException>,
  ) {
    super({
      name: "ValidationException",
      $fault: "client",
      ...opts,
    });
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}
