import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { AwsSharedEntitiesModule } from '../aws-shared-entities/aws-shared-entities.module';
import { DefaultActionHandlerProvider } from '../default-action-handler/default-action-handler.provider';
import { ExistingActionHandlersProvider } from '../default-action-handler/existing-action-handlers.provider';
import { CreateQueueHandler } from './create-queue.handler';
import { DeleteQueueHandler } from './delete-queue.handler';
import { GetQueueAttributesHandler } from './get-queue-attributes.handler';
import { ListQueuesHandler } from './list-queues.handler';
import { PurgeQueueHandler } from './purge-queue.handler';
import { ReceiveMessageHandler } from './receive-message.handler';
import { SetQueueAttributesHandler } from './set-queue-attributes.handler';
import { SqsQueueEntryService } from './sqs-queue-entry.service';
import { SqsQueue } from './sqs-queue.entity';
import { SqsHandlers } from './sqs.constants';

const handlers = [
  CreateQueueHandler,
  DeleteQueueHandler,
  GetQueueAttributesHandler,
  ListQueuesHandler,
  PurgeQueueHandler,
  ReceiveMessageHandler,
  SetQueueAttributesHandler,
]

const actions = [
  Action.SqsAddPermisson,
  Action.SqsChangeMessageVisibility,
  Action.SqsChangeMessageVisibilityBatch,
  Action.SqsCreateQueue,
  Action.SqsDeleteMessage,
  Action.SqsDeleteMessageBatch,
  Action.SqsDeleteQueue,
  Action.SqsGetQueueAttributes,
  Action.SqsGetQueueUrl,
  Action.SqsListDeadLetterSourceQueues,
  Action.SqsListQueues,
  Action.SqsListQueueTags,
  Action.SqsPurgeQueue,
  Action.SqsReceiveMessage,
  Action.SqsRemovePermission,
  Action.SqsSendMessage,
  Action.SqsSendMessageBatch,
  Action.SqsSetQueueAttributes,
  Action.SqsTagQueue,
  Action.SqsUntagQueue,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([SqsQueue]),
    AwsSharedEntitiesModule,
  ],
  providers: [
    ...handlers,
    SqsQueueEntryService,
    ExistingActionHandlersProvider(handlers),
    DefaultActionHandlerProvider(SqsHandlers, Format.Xml, actions),
  ],
  exports: [
    SqsHandlers,
    SqsQueueEntryService,
  ]
})
export class SqsModule {}
