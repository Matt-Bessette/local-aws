import { Provider } from '@nestjs/common';
import { AbstractActionHandler } from '../abstract-action.handler';
import { ExistingActionHandlers } from './default-action-handler.constants';

export const ExistingActionHandlersProvider = (inject): Provider => ({
  provide: ExistingActionHandlers,
  useFactory: (...args: AbstractActionHandler[]) => args.reduce((m, h) => {
    m[h.action] = h;
    return m;
  }, {}),
  inject,
});
