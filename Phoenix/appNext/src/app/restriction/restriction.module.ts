import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestrictionDropdownComponent } from './restriction-dropdown/restriction-dropdown.component';
import { RestrictionSelectorComponent } from './restriction-selector/restriction-selector.component';
import { RestrictionSummaryComponent } from './restriction-summary/restriction-summary.component';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [
    CommonModule,
    PhoenixCommonModule,
    ModalModule.forRoot(),
  ],
  declarations: [
    RestrictionDropdownComponent,
    RestrictionSelectorComponent,
    RestrictionSummaryComponent
  ],
  exports: [
    RestrictionDropdownComponent,
    RestrictionSummaryComponent
  ]
})
export class RestrictionModule { }

