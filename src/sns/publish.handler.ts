import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SqsQueueEntryService } from '../sqs/sqs-queue-entry.service';
import { SnsTopicSubscription } from './sns-topic-subscription.entity';
import * as uuid from 'uuid';
import { AttributesService } from '../aws-shared-entities/attributes.service';
import { SqsQueue } from '../sqs/sqs-queue.entity';

type QueryParams = {
  TopicArn: string;
  TargetArn: string;
  Subject?: string;
  Message: string;
}

@Injectable()
export class PublishHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SnsTopicSubscription)
    private readonly snsTopicSubscriptionRepo: Repository<SnsTopicSubscription>,
    private readonly sqsQueueEntryService: SqsQueueEntryService,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsPublish;
  validator = Joi.object<QueryParams, true>({ 
    TargetArn: Joi.string(),
    TopicArn: Joi.string(),
    Subject: Joi.string().allow(null, ''),
    Message: Joi.string().required(),
  });

  protected async handle({ TopicArn, TargetArn, Message, Subject }: QueryParams, awsProperties: AwsProperties) {
    const arn = TopicArn ?? TargetArn;

    if (!arn) {
      throw new BadRequestException();
    }

    const MessageId = uuid.v4();
    const subscriptions = await this.snsTopicSubscriptionRepo.find({ where: { topicArn: arn } });
    const topicAttributes = await this.attributeService.getByArn(arn);

    for (const sub of subscriptions) {
      const attributes = await this.attributeService.getByArn(sub.arn);
      if (sub.protocol === 'sqs') {
        const { value: isRaw } = attributes.find(a => a.name === 'RawMessageDelivery');
        const [queueAccountId, queueName] = SqsQueue.tryGetAccountIdAndNameFromPathOrArn(sub.endpoint);

        const message = isRaw === 'true' ? Message : JSON.stringify({
          Type: "Notification",
          MessageId,
          TopicArn: arn,
          Subject,
          Message,
          Timestamp: new Date().toISOString(),
          SignatureVersion: topicAttributes.find(a => a.name === 'SignatureVersion')?.value ?? '1',
          Signature: '',
          SigningCertURL: '',
          UnsubscribeURL: `${awsProperties.host}/?Action=Unsubscribe&SubscriptionArn=${sub.arn}`,
        });

        await this.sqsQueueEntryService.publish(queueAccountId, queueName, message);
      }
    }

    return { MessageId };
  }
}
