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
export interface GetItemInput {
  id: string | undefined;
}

export namespace GetItemInput {
  const memberValidators: {
    id?: __MultiConstraintValidator<string>;
  } = {};
  /**
   * @internal
   */
  export const validate = (
    obj: GetItemInput,
    path: string = "",
  ): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(
      member: T,
    ): NonNullable<(typeof memberValidators)[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "id": {
            memberValidators.id = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [...getMemberValidator("id").validate(obj.id, `${path}/id`)];
  };
}

/**
 * @public
 */
export interface GetItemOutput {
  name: string | undefined;
}

export namespace GetItemOutput {
  const memberValidators: {
    name?: __MultiConstraintValidator<string>;
  } = {};
  /**
   * @internal
   */
  export const validate = (
    obj: GetItemOutput,
    path: string = "",
  ): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(
      member: T,
    ): NonNullable<(typeof memberValidators)[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "name": {
            memberValidators.name = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [...getMemberValidator("name").validate(obj.name, `${path}/name`)];
  };
}

/**
 * @public
 */
export class ValidationException extends __BaseException {
  readonly name: "ValidationException" = "ValidationException";
  readonly $fault: "client" = "client";
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
