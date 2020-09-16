import { Demo } from '../shared/index';

export interface DemoState {
    demos: { [Id: string]: Demo };
}
