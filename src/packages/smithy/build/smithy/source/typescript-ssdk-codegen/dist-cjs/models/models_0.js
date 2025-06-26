"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidInputError = exports.HelloOutput = exports.HelloInput = void 0;
const server_common_1 = require("@aws-smithy/server-common");
var HelloInput;
(function (HelloInput) {
    const memberValidators = {};
    HelloInput.validate = (obj, path = "") => {
        function getMemberValidator(member) {
            if (memberValidators[member] === undefined) {
                switch (member) {
                    case "name": {
                        memberValidators["name"] = new server_common_1.CompositeValidator([
                            new server_common_1.RequiredValidator(),
                        ]);
                        break;
                    }
                }
            }
            return memberValidators[member];
        }
        return [
            ...getMemberValidator("name").validate(obj.name, `${path}/name`),
        ];
    };
})(HelloInput || (exports.HelloInput = HelloInput = {}));
var HelloOutput;
(function (HelloOutput) {
    const memberValidators = {};
    HelloOutput.validate = (obj, path = "") => {
        function getMemberValidator(member) {
            if (memberValidators[member] === undefined) {
                switch (member) {
                    case "message": {
                        memberValidators["message"] = new server_common_1.CompositeValidator([
                            new server_common_1.RequiredValidator(),
                        ]);
                        break;
                    }
                }
            }
            return memberValidators[member];
        }
        return [
            ...getMemberValidator("message").validate(obj.message, `${path}/message`),
        ];
    };
})(HelloOutput || (exports.HelloOutput = HelloOutput = {}));
class InvalidInputError extends server_common_1.ServiceException {
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
