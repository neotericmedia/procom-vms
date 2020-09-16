import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JournalBatchComponent } from './journal-batch/journal-batch.component';
import { JournalSearchComponent } from './journal-search/journal-search.component';
import { JournalPendingComponent } from './journal-pending/journal-pending.component';

const routing: Routes = [
    { path: '', redirectTo: 'batches/organization/:organizationId', pathMatch: 'full' },
    { path: 'batches/organization/:organizationId', component: JournalBatchComponent },
    { path: 'pending', component: JournalPendingComponent},
    { path: 'search', component: JournalSearchComponent },
    { path: '**', component: JournalSearchComponent }
];

const journalRouting: ModuleWithProviders = RouterModule.forChild(routing);

@NgModule({
    imports: [ journalRouting ],
    exports: [ RouterModule ]
})
export class JournalRoutingModule { }
