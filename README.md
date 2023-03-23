# Local AWS

## Running
### Environment Variables
| Variable       | Description                                         | Default        |
| -------------- | --------------------------------------------------- | -------------- |
| AWS_ACCOUNT_ID | AWS Account ID resources will default to            | 000000000000   |
| AWS_REGION     | AWS Region resources will default to                | us-east-1      |
| DB_DATABASE    | SQLITE database to write to, defaults to in memory  | :memory:       |
| DEBUG          | Whether or not to reveal sql and other audit trails | false          |
| HOST           | Used in URL generation                              | localhost      |
| PORT           | Used in URL generation & runtime port binding       | 8081           |
| PROTO          | Used in URL generation                              | http           |

## Contributing
### Design Pattern
Handler / Visitor Pattern

Relying on Nest.js's dependency tree and injection, handlers are loaded as singletons and pulled in to a map key'd by AWS's own Action names.

Actions are defined in src/action.enum.ts

app.controller.ts is the entry point for all AWS API calls

Each action is implemented via it's respective handler. Use `aws sns create-topic` as an example:
app.module.ts loads sns.module.ts
app.module.ts injects SnsHandlers
SnsHandlers is a a map of implemented and mocked handlers based on its list of `actions` provided by the sns.module.ts module
sns.module.ts has a list of handlers that have been implemented, including create-topic.handler.ts
create-topic.handler.ts extends abstract-action.handler.ts

abstract-action.handler.ts
* format: the format for output (XML or JSON)
* action: the action the handler is implementing (will be use to key by)
* validator: the Joi validator to be executed to check for required params
* handle(queryParams: T, awsProperties: AwsProperties): Record<string, any> | void
  * the method that implements the AWS action
