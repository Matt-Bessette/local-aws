export enum Action {

  // SecretsManager
  SecretsManagerCancelRotateSecret = 'secretsmanager.CancelRotateSecret',
  SecretsManagerCreateSecret = 'secretsmanager.CreateSecret',
  SecretsManagerDeleteResourcePolicy = 'secretsmanager.DeleteResourcePolicy',
  SecretsManagerDeleteSecret = 'secretsmanager.DeleteSecret',
  SecretsManagerDescribeSecret = 'secretsmanager.DescribeSecret',
  SecretsManagerGetRandomPassword = 'secretsmanager.GetRandomPassword',
  SecretsManagerGetResourcePolicy = 'secretsmanager.GetResourcePolicy',
  SecretsManagerGetSecretValue = 'secretsmanager.GetSecretValue',
  SecretsManagerListSecrets = 'secretsmanager.ListSecrets',
  SecretsManagerListSecretVersionIds = 'secretsmanager.ListSecretVersionIds',
  SecretsManagerPutResourcePolicy = 'secretsmanager.PutResourcePolicy',
  SecretsManagerPutSecretValue = 'secretsmanager.PutSecretValue',
  SecretsManagerRemoveRegionsFromReplication = 'secretsmanager.RemoveRegionsFromReplication',
  SecretsManagerReplicateSecretToRegions = 'secretsmanager.ReplicateSecretToRegions',
  SecretsManagerRestoreSecret = 'secretsmanager.RestoreSecret',
  SecretsManagerRotateSecret = 'secretsmanager.RotateSecret',
  SecretsManagerStopReplicationToReplica = 'secretsmanager.StopReplicationToReplica',
  SecretsManagerTagResource = 'secretsmanager.TagResource',
  SecretsManagerUntagResource = 'secretsmanager.UntagResource',
  SecretsManagerUpdateSecret = 'secretsmanager.UpdateSecret',
  SecretsManagerUpdateSecretVersionStage = 'secretsmanager.UpdateSecretVersionStage',
  SecretsManagerValidateResourcePolicy = 'secretsmanager.ValidateResourcePolicy',

  // SNS
  SnsAddPermission = 'AddPermission',
  SnsCheckIfPhoneNumberIsOptedOut = 'CheckIfPhoneNumberIsOptedOut',
  SnsConfirmSubscription = 'ConfirmSubscription',
  SnsCreatePlatformApplication = 'CreatePlatformApplication',
  SnsCreatePlatformEndpoint = 'CreatePlatformEndpoint',
  SnsCreateSMSSandboxPhoneNumber = 'CreateSMSSandboxPhoneNumber',
  SnsCreateTopic = 'CreateTopic',
  SnsDeleteEndpoint = 'DeleteEndpoint',
  SnsDeletePlatformApplication = 'DeletePlatformApplication',
  SnsDeleteSMSSandboxPhoneNumber = 'DeleteSMSSandboxPhoneNumber',
  SnsDeleteTopic = 'DeleteTopic',
  SnsGetDataProtectionPolicy = 'GetDataProtectionPolicy',
  SnsGetEndpointAttributes = 'GetEndpointAttributes',
  SnsGetPlatformApplicationAttributes = 'GetPlatformApplicationAttributes',
  SnsGetSMSAttributes = 'GetSMSAttributes',
  SnsGetSMSSandboxAccountStatus = 'GetSMSSandboxAccountStatus',
  SnsGetSubscriptionAttributes = 'GetSubscriptionAttributes',
  SnsGetTopicAttributes = 'GetTopicAttributes',
  SnsListEndpointsByPlatformApplication = 'ListEndpointsByPlatformApplication',
  SnsListOriginationNumbers = 'ListOriginationNumbers',
  SnsListPhoneNumbersOptedOut = 'ListPhoneNumbersOptedOut',
  SnsListPlatformApplications = 'ListPlatformApplications',
  SnsListSMSSandboxPhoneNumbers = 'ListSMSSandboxPhoneNumbers',
  SnsListSubscriptions = 'ListSubscriptions',
  SnsListSubscriptionsByTopic = 'ListSubscriptionsByTopic',
  SnsListTagsForResource = 'ListTagsForResource',
  SnsListTopics = 'ListTopics',
  SnsOptInPhoneNumber = 'OptInPhoneNumber',
  SnsPublish = 'Publish',
  SnsPublishBatch = 'PublishBatch',
  SnsPutDataProtectionPolicy = 'PutDataProtectionPolicy',
  SnsRemovePermission = 'RemovePermission',
  SnsSetEndpointAttributes = 'SetEndpointAttributes',
  SnsSetPlatformApplicationAttributes = 'SetPlatformApplicationAttributes',
  SnsSetSMSAttributes = 'SetSMSAttributes',
  SnsSetSubscriptionAttributes = 'SetSubscriptionAttributes',
  SnsSetTopicAttributes = 'SetTopicAttributes',
  SnsSubscribe = 'Subscribe',
  SnsTagResource = 'TagResource',
  SnsUnsubscribe = 'Unsubscribe',
  SnsUntagResource = 'UntagResource',
  SnsVerifySMSSandboxPhoneNumber = 'VerifySMSSandboxPhoneNumber',

  // SQS
  SqsAddPermisson = 'AddPermission',
  SqsChangeMessageVisibility = 'ChangeMessageVisibility',
  SqsChangeMessageVisibilityBatch = 'ChangeMessageVisibilityBatch',
  SqsCreateQueue = 'CreateQueue',
  SqsDeleteMessage = 'DeleteMessage',
  SqsDeleteMessageBatch = 'DeleteMessageBatch',
  SqsDeleteQueue = 'DeleteQueue',
  SqsGetQueueAttributes = 'GetQueueAttributes',
  SqsGetQueueUrl = 'GetQueueUrl',
  SqsListDeadLetterSourceQueues = 'ListDeadLetterSourceQueues',
  SqsListQueues = 'ListQueues',
  SqsListQueueTags = 'ListQueueTags',
  SqsPurgeQueue = 'PurgeQueue',
  SqsReceiveMessage = 'ReceiveMessage',
  SqsRemovePermission = 'RemovePermission',
  SqsSendMessage = 'SendMessage',
  SqsSendMessageBatch = 'SendMessageBatch',
  SqsSetQueueAttributes = 'SetQueueAttributes',
  SqsTagQueue = 'TagQueue',
  SqsUntagQueue = 'UntagQueue',
}