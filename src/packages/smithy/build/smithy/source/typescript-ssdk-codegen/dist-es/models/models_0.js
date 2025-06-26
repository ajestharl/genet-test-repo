import { ServiceException as __BaseException, CompositeValidator as __CompositeValidator, RequiredValidator as __RequiredValidator, } from "@aws-smithy/server-common";
export var HelloInput;
(function (HelloInput) {
    const memberValidators = {};
    HelloInput.validate = (obj, path = "") => {
        function getMemberValidator(member) {
            if (memberValidators[member] === undefined) {
                switch (member) {
                    case "name": {
                        memberValidators["name"] = new __CompositeValidator([
                            new __RequiredValidator(),
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
})(HelloInput || (HelloInput = {}));
export var HelloOutput;
(function (HelloOutput) {
    const memberValidators = {};
    HelloOutput.validate = (obj, path = "") => {
        function getMemberValidator(member) {
            if (memberValidators[member] === undefined) {
                switch (member) {
                    case "message": {
                        memberValidators["message"] = new __CompositeValidator([
                            new __RequiredValidator(),
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
})(HelloOutput || (HelloOutput = {}));
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
