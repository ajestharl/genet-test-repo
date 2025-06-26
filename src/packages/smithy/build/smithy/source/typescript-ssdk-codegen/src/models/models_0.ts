// @ts-nocheck
// smithy-typescript generated code
import {
  ServiceException as __BaseException,
  CompositeValidator as __CompositeValidator,
  MultiConstraintValidator as __MultiConstraintValidator,
  RequiredValidator as __RequiredValidator,
  ValidationFailure as __ValidationFailure,
} from "@aws-smithy/server-common";
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";

/**
 * @public
 */
export interface HelloInput {
  name: string | undefined;
}

export namespace HelloInput {
  const memberValidators : {
    name?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: HelloInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "name": {
            memberValidators["name"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("name").validate(obj.name, `${path}/name`),
    ];
  }
}

/**
 * @public
 */
export interface HelloOutput {
  message: string | undefined;
}

export namespace HelloOutput {
  const memberValidators : {
    message?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: HelloOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "message": {
            memberValidators["message"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("message").validate(obj.message, `${path}/message`),
    ];
  }
}

/**
 * @public
 */
export class InvalidInputError extends __BaseException {
  readonly name: "InvalidInputError" = "InvalidInputError";
  readonly $fault: "client" = "client";
  constructor(opts: __ExceptionOptionType<InvalidInputError, __BaseException>) {
    super({
      name: "InvalidInputError",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
}
