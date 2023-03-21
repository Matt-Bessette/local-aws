import { BadRequestException, Body, Controller, Get, Inject, Post, Headers } from '@nestjs/common';
import { ActionHandlers } from './app.constants';
import * as Joi from 'joi';
import { Action } from './action.enum';
import { AbstractActionHandler, Format } from './abstract-action.handler';
import * as js2xmlparser from 'js2xmlparser';
import { ConfigService } from '@nestjs/config';
import { CommonConfig } from './config/common-config.interface';

@Controller()
export class AppController {

  constructor(
    @Inject(ActionHandlers)
    private readonly actionHandlers: ActionHandlers,
    private readonly configService: ConfigService<CommonConfig>,
  ) {}

  @Post()
  async post(
    @Body() body: Record<string, any>,
    @Headers() headers: Record<string, any>,
  ) {

    const lowerCasedHeaders = Object.keys(headers).reduce((o, k) => {
      o[k.toLocaleLowerCase()] = headers[k];
      return o;
    }, {})

    const queryParams = { ...body, ...lowerCasedHeaders };
    console.log({queryParams})
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

    const awsProperties = { accountId: this.configService.get('AWS_ACCOUNT_ID'), region: this.configService.get('AWS_REGION') };

    const jsonResponse = await handler.getResponse(validQueryParams, awsProperties);
    if (handler.format === Format.Xml) {
      const xmlResponse = js2xmlparser.parse(`${handler.action}Response`, jsonResponse);
      // console.log({xmlResponse})
      return xmlResponse;
    }
    return jsonResponse;
  }
}
