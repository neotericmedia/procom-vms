import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminRouting } from './admin.routing';
import { AdminService } from './admin.service';

@NgModule({
  imports: [
    CommonModule,
    AdminRouting
  ],
  declarations: [AdminComponent],
  providers: [AdminService]
})
export class AdminModule { }
