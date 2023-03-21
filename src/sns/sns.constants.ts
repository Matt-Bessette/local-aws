import { AbstractActionHandler } from '../abstract-action.handler';
import { Action } from '../action.enum';

export type SnsHandlers = Record<Action, AbstractActionHandler>;
export const SnsHandlers = Symbol.for('SNS_HANDLERS');
