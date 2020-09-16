import { TestComponent } from './test.component';
import { Routes, Router, RouterModule, NavigationStart, Event, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestchildComponent } from './testchild/testchild.component';
import { NgSelectizeModule } from 'ng-selectize';
import { SelectModule } from 'ng2-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';

const testRoute: Routes = [
  { path: '', redirectTo: 'test', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'testchild', component: TestchildComponent },
];
export const testRouting = RouterModule.forChild(testRoute);
@NgModule({
  imports: [
    CommonModule,
    PhoenixCommonModule,
    FormsModule,
    ReactiveFormsModule,
    testRouting,
    SelectModule,
    NgSelectizeModule
  ],	
  declarations: [TestComponent,
    TestchildComponent
  ]
})
export class TestModule { }


