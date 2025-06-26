import { de_HelloCommand, se_HelloCommand, } from "../protocols/Aws_restJson1";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
export { $Command };
export class HelloCommand extends $Command.classBuilder()
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
    ];
})
    .s("HelloService", "Hello", {})
    .n("HelloClient", "HelloCommand")
    .f(void 0, void 0)
    .ser(se_HelloCommand)
    .de(de_HelloCommand)
    .build() {
}
