import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { AccordionModule } from 'ngx-bootstrap/accordion';

// import { HeaderComponent } from '../header/header.component';
// import { SidenavComponent } from '../sidenav/sidenav.component';
// import { SidenavService } from './../sidenav/sidenav.service';

@NgModule({
  imports: [
    CommonModule,
    // AccordionModule.forRoot()
  ],
  declarations: [
    // HeaderComponent,
    // SidenavComponent
  ],
  exports: [
    CommonModule,
    // HeaderComponent,
    // SidenavComponent,
    // AccordionModule
  ],
  providers: [
    // SidenavService
  ],
})
export class SharedModule {

}
