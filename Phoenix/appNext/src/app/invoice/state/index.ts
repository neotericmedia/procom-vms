import { invoiceReducer } from './invoice.reducer';

export const invoiceReducers = {
    'invoice': invoiceReducer,
};

export * from './invoice.actions';
export * from './invoice.initial';
export * from './invoice.interface';
export * from './invoice.reducer';
export * from './invoice.state-path';
