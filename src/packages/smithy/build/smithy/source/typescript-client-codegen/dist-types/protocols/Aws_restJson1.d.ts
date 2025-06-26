import { HelloCommandInput, HelloCommandOutput } from "../commands/HelloCommand";
import { HttpRequest as __HttpRequest, HttpResponse as __HttpResponse } from "@smithy/protocol-http";
import { SerdeContext as __SerdeContext } from "@smithy/types";
/**
 * serializeAws_restJson1HelloCommand
 */
export declare const se_HelloCommand: (input: HelloCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * deserializeAws_restJson1HelloCommand
 */
export declare const de_HelloCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<HelloCommandOutput>;
