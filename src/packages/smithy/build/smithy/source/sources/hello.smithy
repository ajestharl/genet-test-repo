namespace example.hello

use aws.protocols#restJson1
use aws.api#service

@service(
    sdkId: "Hello",
    arnNamespace: "example",
    cloudFormationName: "HelloService"
)
@restJson1
service HelloService {
    version: "2024-01-01"
    operations: [Hello]
    errors: [InvalidInputError]
}

@readonly
@http(method: "GET", uri: "/hello/{name}")
operation Hello {
    input: HelloInput
    output: HelloOutput
    errors: [InvalidInputError]
}

structure HelloInput {
    @required
    @httpLabel
    name: String
}

structure HelloOutput {
    @required
    message: String
}

@error("client")
@httpError(400)
structure InvalidInputError {
    @required
    message: String
}
