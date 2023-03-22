import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { AttributesService } from '../aws-shared-entities/attributes.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsQueue } from './sqs-queue.entity';
import { Repository } from 'typeorm';
import { SqsQueueEntryService } from './sqs-queue-entry.service';
import { TagsService } from '../aws-shared-entities/tags.service';

type QueryParams = {
  QueueUrl?: string,
  __path: string;
}

@Injectable()
export class DeleteQueueHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
    private readonly tagsService: TagsService,
    private readonly attributeService: AttributesService,
    private readonly sqsQueueEntryService: SqsQueueEntryService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsDeleteQueue;
  validator = Joi.object<QueryParams, true>({
    QueueUrl: Joi.string(),
    __path: Joi.string().required(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const [accountId, name] = SqsQueue.tryGetAccountIdAndNameFromPathOrArn(params.QueueUrl ?? params.__path);
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId , name  } });
    
    if(!queue) {
      throw new BadRequestException('ResourceNotFoundException');
    }

    await this.sqsQueueEntryService.purge(accountId, name);
    await this.tagsService.deleteByArn(queue.arn);
    await this.attributeService.deleteByArn(queue.arn);
    await queue.remove();
  }

  private async getAttributes(attributeNames: string[], queueArn: string) {
    if (attributeNames.length === 0 || attributeNames.length === 1 && attributeNames[0] === 'All') {
      return await this.attributeService.getByArn(queueArn);
    }
    return await this.attributeService.getByArnAndNames(queueArn, attributeNames);
  }
}
