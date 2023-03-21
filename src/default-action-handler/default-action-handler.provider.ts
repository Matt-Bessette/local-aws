import { Provider } from '@nestjs/common';
import { Action } from '../action.enum';
import { ExistingActionHandlers } from './default-action-handler.constants';
import * as Joi from 'joi';
import { AbstractActionHandler, Format } from '../abstract-action.handler';

export const DefaultActionHandlerProvider = (symbol, format: Format, actions: Action[]): Provider => ({
  provide: symbol,
  useFactory: (existingActionHandlers: ExistingActionHandlers) => {
    const cloned = { ...existingActionHandlers };
    for (const action of actions) {
      if (!cloned[action]) {
        cloned[action] = new (class Default extends AbstractActionHandler { action = action; format = format; validator = Joi.object(); handle = () => {} });
      }
    }
    return cloned;
  },
  inject: [ExistingActionHandlers]
});
