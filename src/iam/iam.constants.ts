import { AbstractActionHandler } from '../abstract-action.handler';
import { Action } from '../action.enum';

export type IAMHandlers = Record<Action, AbstractActionHandler>;
export const IAMHandlers = Symbol.for('IAMHandlers');
