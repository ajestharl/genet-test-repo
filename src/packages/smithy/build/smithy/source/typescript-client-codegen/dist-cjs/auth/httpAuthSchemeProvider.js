"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveHttpAuthSchemeConfig = exports.defaultHelloHttpAuthSchemeProvider = exports.defaultHelloHttpAuthSchemeParametersProvider = void 0;
const util_middleware_1 = require("@smithy/util-middleware");
const defaultHelloHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: (0, util_middleware_1.getSmithyContext)(context).operation,
    };
};
exports.defaultHelloHttpAuthSchemeParametersProvider = defaultHelloHttpAuthSchemeParametersProvider;
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
        schemeId: "smithy.api#noAuth",
    };
}
;
const defaultHelloHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        default:
            {
                options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
            }
            ;
    }
    ;
    return options;
};
exports.defaultHelloHttpAuthSchemeProvider = defaultHelloHttpAuthSchemeProvider;
const resolveHttpAuthSchemeConfig = (config) => {
    return Object.assign(config, {
        authSchemePreference: (0, util_middleware_1.normalizeProvider)(config.authSchemePreference ?? []),
    });
};
exports.resolveHttpAuthSchemeConfig = resolveHttpAuthSchemeConfig;
