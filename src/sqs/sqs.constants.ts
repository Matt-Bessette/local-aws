import { AbstractActionHandler } from '../abstract-action.handler';
import { Action } from '../action.enum';

export type SqsHandlers = Record<Action, AbstractActionHandler>;
export const SqsHandlers = Symbol.for('SQS_HANDLERS');
