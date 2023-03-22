import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SqsQueue } from './sqs-queue.entity';
import { SqsQueueEntryService } from './sqs-queue-entry.service';

type QueryParams = {
  __path: string;
}

@Injectable()
export class PurgeQueueHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    private readonly sqsQueueEntryService: SqsQueueEntryService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsPurgeQueue;
  validator = Joi.object<QueryParams, true>({ __path: Joi.string().required() });

  protected async handle({ __path }: QueryParams, awsProperties: AwsProperties) {

    const [accountId, name] = SqsQueue.getAccountIdAndNameFromPath(__path);
    await this.sqsQueueEntryService.purge(accountId, name);
  }
}
