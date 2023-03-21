import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbstractActionHandler, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { AwsSharedEntitiesModule } from '../aws-shared-entities/aws-shared-entities.module';
import { ExistingActionHandlers } from '../default-action-handler/default-action-handler.constants';
import { DefaultActionHandlerProvider } from '../default-action-handler/default-action-handler.provider';
import { ExistingActionHandlersProvider } from '../default-action-handler/existing-action-handlers.provider';
import { CreateTopicHandler } from './create-topic.handler';
import { GetSubscriptionAttributesHandler } from './get-subscription-attributes.handler';
import { GetTopicAttributesHandler } from './get-topic-attributes.handler';
import { ListTagsForResourceHandler } from './list-tags-for-resource.handler';
import { ListTopicsHandler } from './list-topics.handler';
import { SetSubscriptionAttributesHandler } from './set-subscription-attributes.handler';
import { SetTopicAttributesHandler } from './set-topic-attributes.handler';
import { SnsTopicSubscription } from './sns-topic-subscription.entity';
import { SnsTopic } from './sns-topic.entity';
import { SnsHandlers } from './sns.constants';
import { SubscribeHandler } from './subscribe.handler';

const handlers = [
  CreateTopicHandler, 
  GetSubscriptionAttributesHandler,
  GetTopicAttributesHandler,
  ListTagsForResourceHandler,
  ListTopicsHandler,
  SetSubscriptionAttributesHandler,
  SetTopicAttributesHandler,
  SubscribeHandler,
];

const actions = [
  Action.SnsAddPermission,
  Action.SnsCheckIfPhoneNumberIsOptedOut,
  Action.SnsConfirmSubscription,
  Action.SnsCreatePlatformApplication,
  Action.SnsCreatePlatformEndpoint,
  Action.SnsCreateSMSSandboxPhoneNumber,
  Action.SnsCreateTopic,
  Action.SnsDeleteEndpoint,
  Action.SnsDeletePlatformApplication,
  Action.SnsDeleteSMSSandboxPhoneNumber,
  Action.SnsDeleteTopic,
  Action.SnsGetDataProtectionPolicy,
  Action.SnsGetEndpointAttributes,
  Action.SnsGetPlatformApplicationAttributes,
  Action.SnsGetSMSAttributes,
  Action.SnsGetSMSSandboxAccountStatus,
  Action.SnsGetSubscriptionAttributes,
  Action.SnsGetTopicAttributes,
  Action.SnsListEndpointsByPlatformApplication,
  Action.SnsListOriginationNumbers,
  Action.SnsListPhoneNumbersOptedOut,
  Action.SnsListPlatformApplications,
  Action.SnsListSMSSandboxPhoneNumbers,
  Action.SnsListSubscriptions,
  Action.SnsListSubscriptionsByTopic,
  Action.SnsListTagsForResource,
  Action.SnsListTopics,
  Action.SnsOptInPhoneNumber,
  Action.SnsPublish,
  Action.SnsPublishBatch,
  Action.SnsPutDataProtectionPolicy,
  Action.SnsRemovePermission,
  Action.SnsSetEndpointAttributes,
  Action.SnsSetPlatformApplicationAttributes,
  Action.SnsSetSMSAttributes,
  Action.SnsSetSubscriptionAttributes,
  Action.SnsSetTopicAttributes,
  Action.SnsSubscribe,
  Action.SnsTagResource,
  Action.SnsUnsubscribe,
  Action.SnsUntagResource,
  Action.SnsVerifySMSSandboxPhoneNumber,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([SnsTopic, SnsTopicSubscription]),
    AwsSharedEntitiesModule,
  ],
  providers: [
    ...handlers,
    ExistingActionHandlersProvider(handlers),
    DefaultActionHandlerProvider(SnsHandlers, Format.Xml, actions),
  ],
  exports: [
    SnsHandlers,
  ]
})
export class SnsModule {}
