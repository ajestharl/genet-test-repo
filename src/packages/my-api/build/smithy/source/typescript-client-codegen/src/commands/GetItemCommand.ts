// @ts-nocheck
// smithy-typescript generated code
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ExampleClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../ExampleClient";
import { GetItemInput, GetItemOutput } from "../models/models_0";
import {
  de_GetItemCommand,
  se_GetItemCommand,
} from "../protocols/Aws_restJson1";

/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link GetItemCommand}.
 */
export interface GetItemCommandInput extends GetItemInput {}
/**
 * @public
 *
 * The output of {@link GetItemCommand}.
 */
export interface GetItemCommandOutput extends GetItemOutput, __MetadataBearer {}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { ExampleClient, GetItemCommand } from "@example/my-service-client"; // ES Modules import
 * // const { ExampleClient, GetItemCommand } = require("@example/my-service-client"); // CommonJS import
 * const client = new ExampleClient(config);
 * const input = { // GetItemInput
 *   id: "STRING_VALUE", // required
 * };
 * const command = new GetItemCommand(input);
 * const response = await client.send(command);
 * // { // GetItemOutput
 * //   name: "STRING_VALUE", // required
 * // };
 *
 * ```
 *
 * @param GetItemCommandInput - {@link GetItemCommandInput}
 * @returns {@link GetItemCommandOutput}
 * @see {@link GetItemCommandInput} for command's `input` shape.
 * @see {@link GetItemCommandOutput} for command's `response` shape.
 * @see {@link ExampleClientResolvedConfig | config} for ExampleClient's `config` shape.
 *
 * @throws {@link ValidationException} (client fault)
 *
 * @throws {@link ExampleServiceException}
 * <p>Base exception class for all service exceptions from Example service.</p>
 *
 *
 */
export class GetItemCommand extends $Command
  .classBuilder<
    GetItemCommandInput,
    GetItemCommandOutput,
    ExampleClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >()
  .m(function (
    this: any,
    Command: any,
    cs: any,
    config: ExampleClientResolvedConfig,
    o: any,
  ) {
    return [getSerdePlugin(config, this.serialize, this.deserialize)];
  })
  .s("ExampleService", "GetItem", {})
  .n("ExampleClient", "GetItemCommand")
  .f(void 0, void 0)
  .ser(se_GetItemCommand)
  .de(de_GetItemCommand)
  .build() {
  /** @internal type navigation helper, not in runtime. */
  declare protected static __types: {
    api: {
      input: GetItemInput;
      output: GetItemOutput;
    };
    sdk: {
      input: GetItemCommandInput;
      output: GetItemCommandOutput;
    };
  };
}
