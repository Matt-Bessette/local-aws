import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SqsQueue } from './sqs-queue.entity';
import { SqsQueueEntryService } from './sqs-queue-entry.service';
import * as crypto from 'crypto';

type QueryParams = {
  QueueUrl: string;
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

  audit = false;
  format = Format.Xml;
  action = Action.SqsReceiveMessage;
  validator = Joi.object<QueryParams, true>({ 
    QueueUrl: Joi.string().required(),
    MaxNumberOfMessages: Joi.number(),
    VisibilityTimeout: Joi.number(),
  });

  protected async handle({ QueueUrl, MaxNumberOfMessages, VisibilityTimeout }: QueryParams, awsProperties: AwsProperties) {

    const [accountId, name] = SqsQueue.tryGetAccountIdAndNameFromPathOrArn(QueueUrl);
    const records = await this.sqsQueueEntryService.recieveMessages(accountId, name, MaxNumberOfMessages, VisibilityTimeout);
    return { 
      Message: records.map(r => ({
        MessageId: r.id,
        ReceiptHandle: r.id,
        MD5OfBody: crypto.createHash('md5').update(r.message).digest("hex"),
        Body: r.message,
        Attribute: [
          { Name: 'SenderId', Value: r.senderId },
          { Name: 'SentTimestamp', Value: r.createdAt.valueOf() },
          { Name: 'ApproximateReceiveCount', Value: 1 },
          { Name: 'ApproximateFirstReceiveTimestamp', Value: r.createdAt.valueOf() },
        ],
      })),
    } 
  }
}
