// reverted back from changeset 2385

// import { PhxDialogCommentComponent } from './../phx-dialog-comment/phx-dialog-comment.component';

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule, DxButtonModule, DxDateBoxModule } from 'devextreme-angular';
import { WBComponent } from './WorkflowButtons.component';


@NgModule({
    imports: [
        CommonModule,
        DxButtonModule,
        DxDataGridModule,
        DxSelectBoxModule,
        DxTextBoxModule,
        DxCheckBoxModule,
        DxDateBoxModule,
    ],
    declarations: [
        // fix me
        // WBComponent,
        // PhxDialogCommentComponent,
    ],
    providers: [],
    exports: [

    ]

})
export class WBModule { }
