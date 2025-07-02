namespace com.example

@aws.api#service(
    sdkId: "Example",
    arnNamespace: "example"
)
@aws.protocols#restJson1
service ExampleService {
    version: "2023-01-01",
    operations: [GetItem]
}

@readonly
@http(method: "GET", uri: "/items/{id}")
operation GetItem {
    input: GetItemInput,
    output: GetItemOutput,
    errors: [ValidationException]
}

structure GetItemInput {
    @required
    @httpLabel
    id: String
}

structure GetItemOutput {
    @required
    name: String
}

@error("client")
structure ValidationException {
    @required
    message: String
}
