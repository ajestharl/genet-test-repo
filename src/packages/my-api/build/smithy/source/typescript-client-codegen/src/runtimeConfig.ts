// @ts-nocheck
// smithy-typescript generated code
// @ts-ignore: package.json will be imported from dist folders
import packageInfo from "../package.json"; // eslint-disable-line

import { emitWarningIfUnsupportedVersion as awsCheckVersion } from "@aws-sdk/core";
import {
  NODE_APP_ID_CONFIG_OPTIONS,
  createDefaultUserAgentProvider,
} from "@aws-sdk/util-user-agent-node";
import {
  NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS,
  NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS,
  NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS,
} from "@smithy/config-resolver";
import { Hash } from "@smithy/hash-node";
import {
  NODE_MAX_ATTEMPT_CONFIG_OPTIONS,
  NODE_RETRY_MODE_CONFIG_OPTIONS,
} from "@smithy/middleware-retry";
import { loadConfig as loadNodeConfig } from "@smithy/node-config-provider";
import {
  NodeHttpHandler as RequestHandler,
  streamCollector,
} from "@smithy/node-http-handler";
import {
  loadConfigsForDefaultMode,
  emitWarningIfUnsupportedVersion,
} from "@smithy/smithy-client";
import { calculateBodyLength } from "@smithy/util-body-length-node";
import { resolveDefaultsModeConfig } from "@smithy/util-defaults-mode-node";
import { DEFAULT_RETRY_MODE } from "@smithy/util-retry";
import { ExampleClientConfig } from "./ExampleClient";
import { getRuntimeConfig as getSharedRuntimeConfig } from "./runtimeConfig.shared";

/**
 * @internal
 */
export const getRuntimeConfig = (config: ExampleClientConfig) => {
  emitWarningIfUnsupportedVersion(process.version);
  const defaultsMode = resolveDefaultsModeConfig(config);
  const defaultConfigProvider = () =>
    defaultsMode().then(loadConfigsForDefaultMode);
  const clientSharedValues = getSharedRuntimeConfig(config);
  awsCheckVersion(process.version);
  const profileConfig = { profile: config?.profile };
  return {
    ...clientSharedValues,
    ...config,
    runtime: "node",
    defaultsMode,
    bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
    defaultUserAgentProvider:
      config?.defaultUserAgentProvider ??
      createDefaultUserAgentProvider({
        serviceId: clientSharedValues.serviceId,
        clientVersion: packageInfo.version,
      }),
    maxAttempts:
      config?.maxAttempts ??
      loadNodeConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
    region:
      config?.region ??
      loadNodeConfig(NODE_REGION_CONFIG_OPTIONS, {
        ...NODE_REGION_CONFIG_FILE_OPTIONS,
        ...profileConfig,
      }),
    requestHandler: RequestHandler.create(
      config?.requestHandler ?? defaultConfigProvider,
    ),
    retryMode:
      config?.retryMode ??
      loadNodeConfig(
        {
          ...NODE_RETRY_MODE_CONFIG_OPTIONS,
          default: async () =>
            (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE,
        },
        config,
      ),
    sha256: config?.sha256 ?? Hash.bind(null, "sha256"),
    streamCollector: config?.streamCollector ?? streamCollector,
    useDualstackEndpoint:
      config?.useDualstackEndpoint ??
      loadNodeConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, profileConfig),
    useFipsEndpoint:
      config?.useFipsEndpoint ??
      loadNodeConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, profileConfig),
    userAgentAppId:
      config?.userAgentAppId ??
      loadNodeConfig(NODE_APP_ID_CONFIG_OPTIONS, profileConfig),
  };
};
