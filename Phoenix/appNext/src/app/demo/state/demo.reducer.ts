import { DemoState } from './demo.interface';
import { demoInitial } from './demo.initial';
import { demoActions } from './demo.actions';


export const demoReducer = (
    currState: DemoState = demoInitial,
    action: { type: string, payload?: any }) => {

    const newState: DemoState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

    switch (action.type) {

        case demoActions.demos.updateState:
            newState.demos[payload.Id] = payload;
            break;

    }

    return newState;
};



