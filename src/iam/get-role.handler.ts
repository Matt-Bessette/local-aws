import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IamRole } from './iam-role.entity';

type QueryParams = {
  RoleName: string;
}

@Injectable()
export class GetRoleHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamRole)
    private readonly roleRepo: Repository<IamRole>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamGetRole;
  validator = Joi.object<QueryParams, true>({ 
    RoleName: Joi.string().required(),
  });

  protected async handle({ RoleName }: QueryParams, awsProperties: AwsProperties) {

    const role = await this.roleRepo.findOne({ where: { roleName: RoleName, accountId: awsProperties.accountId } });

    if (!role) {
      throw new NotFoundException('NoSuchEntity', 'The request was rejected because it referenced a resource entity that does not exist. The error message describes the resource.');
    }

    return {
      Role: role.metadata,
    }
  }
}
