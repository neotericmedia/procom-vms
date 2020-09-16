import { PhoenixCommonModule } from './../../common/PhoenixCommon.module';
import { WorkerCompensationHeaderComponent } from './WorkerCompensationHeader/WorkerCompensationHeader.component';
import { WorkerCompensationService } from './../Services/WorkerCompensation.service';

import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerCompensationSetupComponent } from './WorkerCompensationSetup/WorkerCompensationSetup.component';
import { WorkerCompensationSearchComponent } from './worker-compensation-search/worker-compensation-search.component';

import { DxButtonModule, DxDataGridModule, DxSelectBoxModule } from 'devextreme-angular';
import { WorkerCompensationDetailsComponent } from './WorkerCompensationDetails/WorkerCompensationDetails.component';
import { NavigationService } from '../../common/services/navigation.service';


const workerCompensationRoute: Routes = [
  { path: '', component: WorkerCompensationSearchComponent, pathMatch: 'full' },
  { path: 'search', component: WorkerCompensationSearchComponent },
  { path: 'worker-compensation-search', component: WorkerCompensationSearchComponent },
  { path: 'new', component: WorkerCompensationSetupComponent },
  { path: 'edit/:id', component: WorkerCompensationSetupComponent },
  { path: 'details/:id', component: WorkerCompensationSetupComponent }

];

export const workerCompensationRouting = RouterModule.forChild(workerCompensationRoute);

@NgModule({
  imports: [
    CommonModule,
    workerCompensationRouting,
    DxButtonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    ReactiveFormsModule,
    PhoenixCommonModule
  ],
  declarations: [
    WorkerCompensationSetupComponent,
    WorkerCompensationSearchComponent,
    WorkerCompensationHeaderComponent,
    WorkerCompensationDetailsComponent
  ],
  providers: [
    WorkerCompensationService,
  ],
})
export class WorkerCompensationModule implements OnDestroy {


  private sub: any;
  constructor( private $nav: NavigationService) {
    // this.$nav.setTitle('Worker\'s Compensation Code setup', 'icon icon-payroll');
  }

  ngOnDestroy() {
    console.log('destroyed');
    // this.sub.unsubscribe();
  }
}
