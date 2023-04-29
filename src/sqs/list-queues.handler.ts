import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SqsQueue } from './sqs-queue.entity';

type QueryParams = {
}

@Injectable()
export class ListQueuesHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsListQueues;
  validator = Joi.object<QueryParams, true>();

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const queues = await this.sqsQueueRepo.find({ where: { accountId: awsProperties.accountId }});

    return {
      QueueUrl: queues.map((q) => q.getUrl(awsProperties.host))
    }
  }
}
