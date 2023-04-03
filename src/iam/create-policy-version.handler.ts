import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import { IamPolicy } from './iam-policy.entity';
import { breakdownArn } from '../util/breakdown-arn';

type QueryParams = {
  PolicyArn: string;
  PolicyDocument: string;
  SetAsDefault: boolean;
}

@Injectable()
export class CreatePolicyVersionHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamPolicy)
    private readonly policyRepo: Repository<IamPolicy>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamCreatePolicyVersion;
  validator = Joi.object<QueryParams, true>({ 
    PolicyArn: Joi.string().required(),
    PolicyDocument: Joi.string().required(),
    SetAsDefault: Joi.boolean().required(),
  });

  protected async handle({ PolicyArn, PolicyDocument, SetAsDefault }: QueryParams, awsProperties: AwsProperties) {

    const { identifier, accountId } = breakdownArn(PolicyArn);
    const [_policy, name] = identifier.split('/');
    const currentPolicy = await this.policyRepo.findOne({ where: { accountId, name, isDefault: true } });

    if (SetAsDefault) {
      await this.policyRepo.update({ accountId, name }, { isDefault: false })
    }

    const policy = await this.policyRepo.create({
      id: uuid.v4(),
      name: name,
      isDefault: SetAsDefault,
      version: currentPolicy.version + 1,
      document: PolicyDocument,
      accountId: awsProperties.accountId,
    }).save();

    return {
      PolicyVersion: {
        IsDefaultVersion: policy.isDefault,
        VersionId: `v${policy.version}`,
        CreateDate: new Date(policy.createdAt).toISOString(),
      }
    }
  }
}
