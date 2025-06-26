import { HelloServiceException as __BaseException } from "./HelloServiceException";
export class InvalidInputError extends __BaseException {
    name = "InvalidInputError";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidInputError",
            $fault: "client",
            ...opts
        });
        Object.setPrototypeOf(this, InvalidInputError.prototype);
    }
}
