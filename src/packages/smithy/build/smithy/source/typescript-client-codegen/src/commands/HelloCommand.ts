// @ts-nocheck
// smithy-typescript generated code
import {
  HelloClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../HelloClient";
import {
  HelloInput,
  HelloOutput,
} from "../models/models_0";
import {
  de_HelloCommand,
  se_HelloCommand,
} from "../protocols/Aws_restJson1";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";

/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link HelloCommand}.
 */
export interface HelloCommandInput extends HelloInput {}
/**
 * @public
 *
 * The output of {@link HelloCommand}.
 */
export interface HelloCommandOutput extends HelloOutput, __MetadataBearer {}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { HelloClient, HelloCommand } from "@my-org/hello-client"; // ES Modules import
 * // const { HelloClient, HelloCommand } = require("@my-org/hello-client"); // CommonJS import
 * const client = new HelloClient(config);
 * const input = { // HelloInput
 *   name: "STRING_VALUE", // required
 * };
 * const command = new HelloCommand(input);
 * const response = await client.send(command);
 * // { // HelloOutput
 * //   message: "STRING_VALUE", // required
 * // };
 *
 * ```
 *
 * @param HelloCommandInput - {@link HelloCommandInput}
 * @returns {@link HelloCommandOutput}
 * @see {@link HelloCommandInput} for command's `input` shape.
 * @see {@link HelloCommandOutput} for command's `response` shape.
 * @see {@link HelloClientResolvedConfig | config} for HelloClient's `config` shape.
 *
 * @throws {@link InvalidInputError} (client fault)
 *
 * @throws {@link HelloServiceException}
 * <p>Base exception class for all service exceptions from Hello service.</p>
 *
 *
 */
export class HelloCommand extends $Command.classBuilder<HelloCommandInput, HelloCommandOutput, HelloClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>()
      .m(function (this: any, Command: any, cs: any, config: HelloClientResolvedConfig, o: any) {
          return [

  getSerdePlugin(config, this.serialize, this.deserialize),
      ];
  })
  .s("HelloService", "Hello", {

  })
  .n("HelloClient", "HelloCommand")
  .f(void 0, void 0)
  .ser(se_HelloCommand)
  .de(de_HelloCommand)
.build() {
/** @internal type navigation helper, not in runtime. */
declare protected static __types: {
  api: {
      input: HelloInput;
      output: HelloOutput;
  };
  sdk: {
      input: HelloCommandInput;
      output: HelloCommandOutput;
  };
};
}
