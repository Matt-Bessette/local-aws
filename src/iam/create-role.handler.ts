import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IamRole } from './iam-role.entity';
import * as uuid from 'uuid';
import { IamPolicy } from './iam-policy.entity';

type QueryParams = {
  RoleName: string;
  Path: string;
  AssumeRolePolicyDocument: string;
}

@Injectable()
export class CreateRoleHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamRole)
    private readonly roleRepo: Repository<IamRole>,
    @InjectRepository(IamPolicy)
    private readonly policyRepo: Repository<IamPolicy>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamCreateRole;
  validator = Joi.object<QueryParams, true>({ 
    RoleName: Joi.string().required(),
    Path: Joi.string().required(),
    AssumeRolePolicyDocument: Joi.string().required(),
  });

  protected async handle({ RoleName, Path, AssumeRolePolicyDocument }: QueryParams, awsProperties: AwsProperties) {

    const policy = await this.policyRepo.create({
      id: uuid.v4(),
      name: `${RoleName}-AssumeRolePolicyDocument`,
      document: AssumeRolePolicyDocument,
      accountId: awsProperties.accountId,
    }).save();

    const id = uuid.v4();

    await this.roleRepo.create({
      id,
      roleName: RoleName,
      path: Path,
      accountId: awsProperties.accountId,
      assumeRolePolicyDocumentId: policy.id,
    }).save();

    const role = await this.roleRepo.findOne({ where: { id }});

    return {
      Role: role.metadata,
    }
  }
}
