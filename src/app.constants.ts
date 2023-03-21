import { AbstractActionHandler } from './abstract-action.handler';
import { Action } from './action.enum';

export type ActionHandlers = Record<Action, AbstractActionHandler>;
export const ActionHandlers = Symbol.for('ACTION_HANDLERS');
