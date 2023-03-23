import { AbstractActionHandler } from '../abstract-action.handler';
import { Action } from '../action.enum';

export type KMSHandlers = Record<Action, AbstractActionHandler>;
export const KMSHandlers = Symbol.for('KMSHandlers');
