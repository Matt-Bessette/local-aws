import { BadRequestException, Body, Controller, Inject, Post, Headers, Req, HttpCode, UseInterceptors } from '@nestjs/common';
import { ActionHandlers } from './app.constants';
import * as Joi from 'joi';
import { Action } from './action.enum';
import { AbstractActionHandler, Format } from './abstract-action.handler';
import * as js2xmlparser from 'js2xmlparser';
import { ConfigService } from '@nestjs/config';
import { CommonConfig } from './config/common-config.interface';
import { Request } from 'express';
import { AuditInterceptor } from './audit/audit.interceptor';

@Controller()
export class AppController {

  constructor(
    @Inject(ActionHandlers)
    private readonly actionHandlers: ActionHandlers,
    private readonly configService: ConfigService<CommonConfig>,
  ) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(AuditInterceptor)
  async post(
    @Req() request: Request,
    @Body() body: Record<string, any>,
    @Headers() headers: Record<string, any>,
  ) {

    const lowerCasedHeaders = Object.keys(headers).reduce((o, k) => {
      o[k.toLocaleLowerCase()] = headers[k];
      return o;
    }, {})

    const queryParams = { __path: request.path, ...body, ...lowerCasedHeaders };
    const actionKey = queryParams['x-amz-target'] ? 'x-amz-target' : 'Action';
    const { error: actionError } = Joi.object({
      [actionKey]: Joi.string().valid(...Object.values(Action)).required(),
    }).validate(queryParams, { allowUnknown: true });

    if (actionError) {
      throw new BadRequestException(actionError);
    }

    const action = queryParams[actionKey];
    const handler: AbstractActionHandler = this.actionHandlers[action];
    const { error: validatorError, value: validQueryParams } = handler.validator.validate(queryParams, { allowUnknown: true, abortEarly: false });

    if (validatorError) {
      throw new BadRequestException(validatorError);
    }

    const awsProperties = { 
      accountId: this.configService.get('AWS_ACCOUNT_ID'), 
      region: this.configService.get('AWS_REGION'),
      host: `${this.configService.get('PROTO')}://${this.configService.get('HOST')}:${this.configService.get('PORT')}`,
    };

    const jsonResponse = await handler.getResponse(validQueryParams, awsProperties);
    if (handler.format === Format.Xml) {
      return js2xmlparser.parse(`${handler.action}Response`, jsonResponse);
    }
    return jsonResponse;
  }
}
