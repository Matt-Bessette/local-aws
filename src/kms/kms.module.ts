import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { AwsSharedEntitiesModule } from '../aws-shared-entities/aws-shared-entities.module';
import { DefaultActionHandlerProvider } from '../default-action-handler/default-action-handler.provider';
import { ExistingActionHandlersProvider } from '../default-action-handler/existing-action-handlers.provider';
import { CreateAliasHandler } from './create-alias.handler';
import { DescribeKeyHandler } from './describe-key.handler';
import { KmsKeyAlias } from './kms-key-alias.entity';
import { KmsKey } from './kms-key.entity';
import { KMSHandlers } from './kms.constants';

const handlers = [
  CreateAliasHandler,
  DescribeKeyHandler,
]

const actions = [
  Action.KmsCancelKeyDeletion,
  Action.KmsConnectCustomKeyStore,
  Action.KmsCreateAlias,
  Action.KmsCreateCustomKeyStore,
  Action.KmsCreateGrant,
  Action.KmsCreateKey,
  Action.KmsDecrypt,
  Action.KmsDeleteAlias,
  Action.KmsDeleteCustomKeyStore,
  Action.KmsDeleteImportedKeyMaterial,
  Action.KmsDescribeCustomKeyStores,
  Action.KmsDescribeKey,
  Action.KmsDisableKey,
  Action.KmsDisableKeyRotation,
  Action.KmsDisconnectCustomKeyStore,
  Action.KmsEnableKey,
  Action.KmsEnableKeyRotation,
  Action.KmsEncrypt,
  Action.KmsGenerateDataKey,
  Action.KmsGenerateDataKeyPair,
  Action.KmsGenerateDataKeyPairWithoutPlaintext,
  Action.KmsGenerateDataKeyWithoutPlaintext,
  Action.KmsGenerateMac,
  Action.KmsGenerateRandom,
  Action.KmsGetKeyPolicy,
  Action.KmsGetKeyRotationStatus,
  Action.KmsGetParametersForImport,
  Action.KmsGetPublicKey,
  Action.KmsImportKeyMaterial,
  Action.KmsListAliases,
  Action.KmsListGrants,
  Action.KmsListKeyPolicies,
  Action.KmsListKeys,
  Action.KmsListResourceTags,
  Action.KmsListRetirableGrants,
  Action.KmsPutKeyPolicy,
  Action.KmsReEncrypt,
  Action.KmsReplicateKey,
  Action.KmsRetireGrant,
  Action.KmsRevokeGrant,
  Action.KmsScheduleKeyDeletion,
  Action.KmsSign,
  Action.KmsTagResource,
  Action.KmsUntagResource,
  Action.KmsUpdateAlias,
  Action.KmsUpdateCustomKeyStore,
  Action.KmsUpdateKeyDescription,
  Action.KmsUpdatePrimaryRegion,
  Action.KmsVerify,
  Action.KmsVerifyMac,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([KmsKey, KmsKeyAlias]),
    AwsSharedEntitiesModule,
  ],
  providers: [
    ...handlers,
    ExistingActionHandlersProvider(handlers),
    DefaultActionHandlerProvider(KMSHandlers, Format.Json, actions),
  ],
  exports: [KMSHandlers],
})
export class KmsModule {}
