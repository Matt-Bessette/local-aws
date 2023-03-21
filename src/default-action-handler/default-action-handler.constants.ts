import { AbstractActionHandler } from '../abstract-action.handler';
import { Action } from '../action.enum';

export type ExistingActionHandlers = Record<Action, AbstractActionHandler>;
export const ExistingActionHandlers = Symbol.for('EXISTING_ACTION_HANDLERS');
