import { PhoenixCommonModule } from './../../common/PhoenixCommon.module'; 
import { WCBSubdivisionService } from './../Services/WCBSubdivision.service';

import { Routes, RouterModule } from '@angular/router';
import { NgModule, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WCBSubdivisionPageComponent } from './WCBSubdivisionDetails/WCBSubdivisionPage/WCBSubdivisionPage.component';
import { WCBSubdivisionDetailsTabComponent } from './WCBSubdivisionDetails/WCBSubdivisionDetailsTab/WCBSubdivisionDetailsTab.component'; 
import { DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule, DxButtonModule, DxDateBoxModule } from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { SortArrayOfObjectsPipe } from './../../common/pipes/sortArrayOfObjects.pipe';
import { CommonService } from '../../common/services/common.service';
import { WcbSubdivisionSearchComponent } from './wcb-subdivision-search/wcb-subdivision-search.component'; 
import { NavigationService } from '../../common/services/navigation.service';

const wcbSubdivisionRoute: Routes = [
	{ path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: WcbSubdivisionSearchComponent },
    { path: 'wcb-subdivision-search', component: WcbSubdivisionSearchComponent },
    { path: 'details/:versionId', component: WCBSubdivisionPageComponent }, 
];

export const wcbSubdivisionRouting = RouterModule.forChild(wcbSubdivisionRoute);

@NgModule({
    imports: [
        CommonModule, wcbSubdivisionRouting, DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDateBoxModule,
        PhoenixCommonModule, FormsModule, ReactiveFormsModule 
    ],
    declarations: [
        WCBSubdivisionPageComponent, WCBSubdivisionDetailsTabComponent, WcbSubdivisionSearchComponent

    ],
    providers: [WCBSubdivisionService, SortArrayOfObjectsPipe, CommonService],
    exports: [

    ]

})
export class WCBSubdivisionModule {
     constructor(  private $nav: NavigationService ) {
         //this.$nav.setTitle('Worker Compensation Board Subdivision Management', ['icon icon-payroll']);
    }

 }

