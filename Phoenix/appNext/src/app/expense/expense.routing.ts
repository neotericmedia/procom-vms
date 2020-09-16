import { RouterModule } from '@angular/router';
import { SetupExpenseClaimComponent } from './component/setup-expense-claim/setup-expense-claim.component';
import { ExpenseDetailComponent } from './component/expense-detail/expense-detail.component';
import { ExpenseSearchComponent } from './component/expense-search/expense-search.component';
import { ExpenseClaimNotesAttachmentsComponent } from './component/expense-claim-notes-attachments/expense-claim-notes-attachments.component';
import { ExpenseClaimComponent } from './component/expense-claim/expense-claim.component';
import { ExpenseClaimHistoryComponent } from './component/expense-claim-history/expense-claim-history.component';
import { ExpenseExceptionsSearchComponent } from './component/expense-exceptions-search/expense-exceptions-search.component';

export const ExpenseRouting = RouterModule.forChild([
    { path: 'search', component: ExpenseSearchComponent, pathMatch: 'full' },
    { path: 'exceptions', component: ExpenseExceptionsSearchComponent, pathMatch: 'full' },
    { path: 'setup', component: SetupExpenseClaimComponent, pathMatch: 'full' },
    {
        path: ':Id', component: ExpenseDetailComponent,
        children: [
            { path: 'detail', component: ExpenseClaimComponent },
            { path: 'notes', component: ExpenseClaimNotesAttachmentsComponent },
            { path: 'history', component: ExpenseClaimHistoryComponent },
            { path: '**', component: ExpenseClaimComponent, pathMatch: 'full' },
        ]
    },
    { path: '**', component: ExpenseSearchComponent, pathMatch: 'full' },
]);
