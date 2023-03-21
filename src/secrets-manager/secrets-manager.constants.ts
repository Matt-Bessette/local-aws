import { AbstractActionHandler } from '../abstract-action.handler';
import { Action } from '../action.enum';

export type SecretsManagerHandlers = Record<Action, AbstractActionHandler>;
export const SecretsManagerHandlers = Symbol.for('SecretsManagerHandlers');
