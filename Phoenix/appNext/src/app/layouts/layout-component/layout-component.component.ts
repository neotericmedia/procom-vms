import { Component, OnInit, ViewChild } from '@angular/core';
import { SidenavComponent } from '../../sidenav/sidenav.component';

@Component({
  selector: 'app-layout-component',
  templateUrl: './layout-component.component.html',
  styleUrls: ['./layout-component.component.less']
})
export class LayoutComponentComponent implements OnInit {
  @ViewChild(SidenavComponent) sideNav: SidenavComponent;

  constructor() {}

  ngOnInit() {}

  onSideMenuOpenChanged(event: any) {
    this.sideNav.toggleMobileExpand();
  }
}
