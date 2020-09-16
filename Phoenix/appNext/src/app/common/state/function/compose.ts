//import { Action } from '@angular-redux';
export interface Action<P> {
    type: string;
    payload: P;
}


export function compose<T, P>(
    initial: T,
    tasks: { [name: string]: (state: T, payload?: P) => void }
) {
    return (state: T = initial || <T>{}, action: Action<P>) => {

        // always deep copy to follow immutable rule
        const reply = JSON.parse(JSON.stringify(state));
        const payload = JSON.parse(JSON.stringify(action.payload));

        // run the task
        // - the task function return should not receive the state as a reply
        //   this is done to keep the reply variable purely based on the state
        const task = tasks[action.type];
        if (task) { task(reply, payload); }

        // always return the reply to keep as pure function
        return reply;

    };
}