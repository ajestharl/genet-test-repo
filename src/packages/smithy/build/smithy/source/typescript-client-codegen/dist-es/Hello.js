import { HelloClient, } from "./HelloClient";
import { HelloCommand, } from "./commands/HelloCommand";
import { createAggregatedClient } from "@smithy/smithy-client";
const commands = {
    HelloCommand,
};
export class Hello extends HelloClient {
}
createAggregatedClient(commands, Hello);
