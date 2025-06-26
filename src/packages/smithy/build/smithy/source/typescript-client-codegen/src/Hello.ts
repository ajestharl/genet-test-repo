// @ts-nocheck
// smithy-typescript generated code
import {
  HelloClient,
  HelloClientConfig,
} from "./HelloClient";
import {
  HelloCommand,
  HelloCommandInput,
  HelloCommandOutput,
} from "./commands/HelloCommand";
import { createAggregatedClient } from "@smithy/smithy-client";
import { HttpHandlerOptions as __HttpHandlerOptions } from "@smithy/types";

const commands = {
  HelloCommand,
}

export interface Hello {
  /**
   * @see {@link HelloCommand}
   */
  hello(
    args: HelloCommandInput,
    options?: __HttpHandlerOptions,
  ): Promise<HelloCommandOutput>;
  hello(
    args: HelloCommandInput,
    cb: (err: any, data?: HelloCommandOutput) => void
  ): void;
  hello(
    args: HelloCommandInput,
    options: __HttpHandlerOptions,
    cb: (err: any, data?: HelloCommandOutput) => void
  ): void;

}

/**
 * @public
 */
export class Hello extends HelloClient implements Hello {}
createAggregatedClient(commands, Hello);
