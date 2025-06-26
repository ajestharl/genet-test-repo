"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidInputError = void 0;
const HelloServiceException_1 = require("./HelloServiceException");
class InvalidInputError extends HelloServiceException_1.HelloServiceException {
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
exports.InvalidInputError = InvalidInputError;
