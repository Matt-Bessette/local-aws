import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { AttributesService } from '../aws-shared-entities/attributes.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsQueue } from './sqs-queue.entity';
import { Repository } from 'typeorm';
import { SqsQueueEntryService } from './sqs-queue-entry.service';

type QueryParams = {
  QueueUrl?: string,
  'AttributeName.1'?: string;
  __path: string;
}

@Injectable()
export class GetQueueAttributesHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
    private readonly attributeService: AttributesService,
    private readonly sqsQueueEntryService: SqsQueueEntryService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsGetQueueAttributes;
  validator = Joi.object<QueryParams, true>({
    QueueUrl: Joi.string(),
    'AttributeName.1': Joi.string(),
    __path: Joi.string().required(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const attributeNames = Object.keys(params).reduce((l, k) => {
      const [name, _] = k.split('.');
      if (name === 'AttributeName') {
        l.push(params[k]);
      }
      return l;
    }, []);

    const [accountId, name] = SqsQueue.tryGetAccountIdAndNameFromPathOrArn(params.QueueUrl ?? params.__path);
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId , name  } });
    
    if(!queue) {
      return;
    }

    const queueMetrics = this.sqsQueueEntryService.metrics(queue.arn);
    const attributes = await this.getAttributes(attributeNames, queue.arn);
    const attributeMap = attributes.reduce((m, a) => {
      m[a.name] = a.value;
      return m;
    }, {});

    const response = {
      ...attributeMap,
      ApproximateNumberOfMessages: `${queueMetrics.total}`,
      ApproximateNumberOfMessagesNotVisible: `${queueMetrics.inFlight}`,
      CreatedTimestamp: `${new Date(queue.createdAt).getTime()}`,
      LastModifiedTimestamp: `${new Date(queue.updatedAt).getTime()}`,
      QueueArn: queue.arn,
    }
    return { Attribute: Object.keys(response).map(k => ({
        Name: k,
        Value: response[k],
      })) 
    };
  }

  private async getAttributes(attributeNames: string[], queueArn: string) {
    if (attributeNames.length === 0 || attributeNames.length === 1 && attributeNames[0] === 'All') {
      return await this.attributeService.getByArn(queueArn);
    }
    return await this.attributeService.getByArnAndNames(queueArn, attributeNames);
  }
}
