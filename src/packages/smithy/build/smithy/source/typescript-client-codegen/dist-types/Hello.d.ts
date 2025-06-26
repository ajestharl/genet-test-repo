import { HelloClient } from "./HelloClient";
import { HelloCommandInput, HelloCommandOutput } from "./commands/HelloCommand";
import { HttpHandlerOptions as __HttpHandlerOptions } from "@smithy/types";
export interface Hello {
    /**
     * @see {@link HelloCommand}
     */
    hello(args: HelloCommandInput, options?: __HttpHandlerOptions): Promise<HelloCommandOutput>;
    hello(args: HelloCommandInput, cb: (err: any, data?: HelloCommandOutput) => void): void;
    hello(args: HelloCommandInput, options: __HttpHandlerOptions, cb: (err: any, data?: HelloCommandOutput) => void): void;
}
/**
 * @public
 */
export declare class Hello extends HelloClient implements Hello {
}
