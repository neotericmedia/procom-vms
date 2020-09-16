import { Reducer } from 'redux';
import { commonListsReducers } from '../lists';

import { demoReducers } from '../../demo/state/index';
import { expenseReducers } from './../../expense/state/index';
import { timeSheetReducers } from './../../time-sheet/state/index';
import { projectReducers } from './../../project/state';
import { organizationReducers } from './../../organization/state/index';
import { complianceReducers } from '../../compliance/state/index';
import { invoiceReducers } from '../../invoice/state/index';
import { workorderReducers } from '../../workorder/state/index';
import { profileReducers } from '../../contact/state/index';
import { purchaseOrderReducers } from '../../purchase-order/state/index';
import { documentRuleReducers } from '../../document-rule/state/index';
import { subscriptionReducers } from '../../subscription/state/index';
import {  } from '../../contact/state/index';
import { transactionReducers } from '../../transaction/state/index';
import { commissionRateReducers } from '../../commission/state/index';

export const reducers: { [reducerRootPath: string]: Reducer<any> } = Object.assign({},
    commonListsReducers,
    demoReducers,
    timeSheetReducers,
    expenseReducers,
    projectReducers,
    organizationReducers,
    complianceReducers,
    invoiceReducers,
    workorderReducers,
    profileReducers,
    purchaseOrderReducers,
    documentRuleReducers,
    subscriptionReducers,
    profileReducers,
    transactionReducers,
    commissionRateReducers
);
