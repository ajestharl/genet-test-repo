"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hello = void 0;
const HelloClient_1 = require("./HelloClient");
const HelloCommand_1 = require("./commands/HelloCommand");
const smithy_client_1 = require("@smithy/smithy-client");
const commands = {
    HelloCommand: HelloCommand_1.HelloCommand,
};
class Hello extends HelloClient_1.HelloClient {
}
exports.Hello = Hello;
(0, smithy_client_1.createAggregatedClient)(commands, Hello);
