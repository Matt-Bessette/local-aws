import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { AwsSharedEntitiesModule } from '../aws-shared-entities/aws-shared-entities.module';
import { DefaultActionHandlerProvider } from '../default-action-handler/default-action-handler.provider';
import { ExistingActionHandlersProvider } from '../default-action-handler/existing-action-handlers.provider';
import { SecretsManagerHandlers } from './secrets-manager.constants';

const handlers = [

]

const actions = [
  Action.SecretsManagerCancelRotateSecret,
  Action.SecretsManagerCreateSecret,
  Action.SecretsManagerDeleteResourcePolicy,
  Action.SecretsManagerDeleteSecret,
  Action.SecretsManagerDescribeSecret,
  Action.SecretsManagerGetRandomPassword,
  Action.SecretsManagerGetResourcePolicy,
  Action.SecretsManagerGetSecretValue,
  Action.SecretsManagerListSecrets,
  Action.SecretsManagerListSecretVersionIds,
  Action.SecretsManagerPutResourcePolicy,
  Action.SecretsManagerPutSecretValue,
  Action.SecretsManagerRemoveRegionsFromReplication,
  Action.SecretsManagerReplicateSecretToRegions,
  Action.SecretsManagerRestoreSecret,
  Action.SecretsManagerRotateSecret,
  Action.SecretsManagerStopReplicationToReplica,
  Action.SecretsManagerTagResource,
  Action.SecretsManagerUntagResource,
  Action.SecretsManagerUpdateSecret,
  Action.SecretsManagerUpdateSecretVersionStage,
  Action.SecretsManagerValidateResourcePolicy,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    AwsSharedEntitiesModule,
  ],
  providers: [
    ...handlers,
    ExistingActionHandlersProvider(handlers),
    DefaultActionHandlerProvider(SecretsManagerHandlers, Format.Json, actions),
  ],
  exports: [SecretsManagerHandlers],
})
export class SecretsManagerModule {}
