import { RouterModule } from '@angular/router';
import { DemoSearchComponent } from './demo-search/demo-search.component';
import { DemoComponent } from './demo/demo.component';
import { DemoAttachmentsComponent } from './demo-attachments/demo-attachments.component';
import { DemoDetailComponent } from './demo-detail/demo-detail.component';
import { DemoLocalizationComponent } from './demo-localization/demo-localization.component';
import { DemoRemoteDataGridComponent } from './demo-remote-data-grid/demo-remote-data-grid.component';

export const DemoRouting = RouterModule.forChild([
    { path: 'search', component: DemoSearchComponent, pathMatch: 'full' },
    { path: 'local', component: DemoLocalizationComponent },
    { path: 'remoteGrid', component: DemoRemoteDataGridComponent },
    {
        path: ':id', component: DemoComponent,
        children: [
            { path: 'detail', component: DemoDetailComponent },
            { path: 'attachments', component: DemoAttachmentsComponent },
            { path: '**', component: DemoDetailComponent, pathMatch: 'full' },
        ]
    },
    { path: '**', component: DemoSearchComponent, pathMatch: 'full' },
]);
