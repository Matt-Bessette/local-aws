import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SqsQueue } from './sqs-queue.entity';
import { SqsQueueEntryService } from './sqs-queue-entry.service';
import crypto from 'crypto';

type QueryParams = {
  __path: string;
  MaxNumberOfMessages?: number;
  VisibilityTimeout?: number;
}

@Injectable()
export class ReceiveMessageHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    private readonly sqsQueueEntryService: SqsQueueEntryService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsReceiveMessage;
  validator = Joi.object<QueryParams, true>({ 
    __path: Joi.string().required(),
    MaxNumberOfMessages: Joi.number(),
    VisibilityTimeout: Joi.number(),
  });

  protected async handle({ __path, MaxNumberOfMessages, VisibilityTimeout }: QueryParams, awsProperties: AwsProperties) {

    const [accountId, name] = SqsQueue.getAccountIdAndNameFromPath(__path);
    const records = await this.sqsQueueEntryService.recieveMessages(accountId, name, MaxNumberOfMessages, VisibilityTimeout);
    return records.map(r => ({
      Message: {
        MessageId: r.id,
        ReceiptHandle: r.id,
        MD5OfBody: crypto.createHash('md5').update(r.message).digest("hex"),
        Body: r.message,
        '#': [
          { Attribute: { Name: 'SenderId', Value: r.senderId }},
          { Attribute: { Name: 'SentTimestamp', Value: r.createdAt.getSeconds() }},
          { Attribute: { Name: 'ApproximateReceiveCount', Value: 1 }},
          { Attribute: { Name: 'ApproximateFirstReceiveTimestamp', Value: r.createdAt.getSeconds() }},
        ]
      }
    }));
  }
}
