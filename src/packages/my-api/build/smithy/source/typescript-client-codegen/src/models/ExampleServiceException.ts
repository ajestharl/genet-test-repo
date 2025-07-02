// @ts-nocheck
// smithy-typescript generated code
import {
  ServiceException as __ServiceException,
  ServiceExceptionOptions as __ServiceExceptionOptions,
} from "@smithy/smithy-client";

export type { __ServiceExceptionOptions };

export { __ServiceException };

/**
 * @public
 *
 * Base exception class for all service exceptions from Example service.
 */
export class ExampleServiceException extends __ServiceException {
  /**
   * @internal
   */
  constructor(options: __ServiceExceptionOptions) {
    super(options);
    Object.setPrototypeOf(this, ExampleServiceException.prototype);
  }
}
