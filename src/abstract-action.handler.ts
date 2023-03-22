import { Action } from './action.enum';
import * as uuid from 'uuid';
import * as Joi from 'joi';

export type AwsProperties = {
  accountId: string;
  region: string;
  host: string;
}

export enum Format {
  Xml,
  Json,
};

export abstract class AbstractActionHandler<T = Record<string, string | number | boolean>> {

  abstract format: Format;
  abstract action: Action;
  abstract validator: Joi.ObjectSchema<T>;
  protected abstract handle(queryParams: T, awsProperties: AwsProperties): Record<string, any> | void;

  async getResponse(queryParams: T, awsProperties: AwsProperties) {
    if (this.format === Format.Xml) {
      return await this.getXmlResponse(queryParams, awsProperties);
    }
    return await this.getJsonResponse(queryParams, awsProperties);
  }

  private async getXmlResponse(queryParams: T, awsProperties: AwsProperties) {
    const response = {
      '@': {
        xmlns: "https://sns.amazonaws.com/doc/2010-03-31/"
      },
      ResponseMetadata: {
        RequestId: uuid.v4(),
      }
    }

    const result = await this.handle(queryParams, awsProperties);

    if (!result) {
      return response;
    }

    return {
      [`${this.action}Result`]: {
        ...result,
      }
    }
  }

  private async getJsonResponse(queryParams: T, awsProperties: AwsProperties) {
    const result = await this.handle(queryParams, awsProperties);
    if (result) {
      return result;
    }
    return;
  }
}
