import { getSmithyContext, normalizeProvider, } from "@smithy/util-middleware";
export const defaultHelloHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: getSmithyContext(context).operation,
    };
};
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
        schemeId: "smithy.api#noAuth",
    };
}
;
export const defaultHelloHttpAuthSchemeProvider = (authParameters) => {
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
export const resolveHttpAuthSchemeConfig = (config) => {
    return Object.assign(config, {
        authSchemePreference: normalizeProvider(config.authSchemePreference ?? []),
    });
};
