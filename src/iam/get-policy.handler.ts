import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IamPolicy } from './iam-policy.entity';
import { breakdownArn } from '../util/breakdown-arn';
import { IamRolePolicyAttachment } from './iam-role-policy-attachment.entity';

type QueryParams = {
  PolicyArn: string;
}

@Injectable()
export class GetPolicyHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamPolicy)
    private readonly policyRepo: Repository<IamPolicy>,
    @InjectRepository(IamRolePolicyAttachment)
    private readonly attachmentRepo: Repository<IamRolePolicyAttachment>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamGetPolicy;
  validator = Joi.object<QueryParams, true>({ 
    PolicyArn: Joi.string().required(),
  });

  protected async handle({ PolicyArn }: QueryParams, awsProperties: AwsProperties) {

    const { identifier, accountId } = breakdownArn(PolicyArn);
    const [_policy, name] = identifier.split('/');
    const policy = await this.policyRepo.findOne({ where: { name, accountId, isDefault: true }});

    if (!policy) {
      throw new NotFoundException('NoSuchEntity', 'The request was rejected because it referenced a resource entity that does not exist. The error message describes the resource.');
    }

    const attachmentCount = await this.attachmentRepo.count({ where: { policyArn: policy.arn } });

    return {
      Policy: {
        PolicyName: policy.name,
        DefaultVersionId: `v${policy.version}`,
        PolicyId: policy.id,
        Path: '/',
        Arn: policy.arn,
        AttachmentCount: attachmentCount,
        CreateDate: new Date(policy.createdAt).toISOString(),
        UpdateDate: new Date(policy.updatedAt).toISOString(),
      }
    }
  }
}
