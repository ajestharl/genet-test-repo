// @ts-nocheck
// smithy-typescript generated code
import { createAggregatedClient } from "@smithy/smithy-client";
import { HttpHandlerOptions as __HttpHandlerOptions } from "@smithy/types";
import {
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
} from "./commands/GetItemCommand";
import { ExampleClient, ExampleClientConfig } from "./ExampleClient";

const commands = {
  GetItemCommand,
};

export interface Example {
  /**
   * @see {@link GetItemCommand}
   */
  getItem(
    args: GetItemCommandInput,
    options?: __HttpHandlerOptions,
  ): Promise<GetItemCommandOutput>;
  getItem(
    args: GetItemCommandInput,
    cb: (err: any, data?: GetItemCommandOutput) => void,
  ): void;
  getItem(
    args: GetItemCommandInput,
    options: __HttpHandlerOptions,
    cb: (err: any, data?: GetItemCommandOutput) => void,
  ): void;
}

/**
 * @public
 */
export class Example extends ExampleClient implements Example {}
createAggregatedClient(commands, Example);
