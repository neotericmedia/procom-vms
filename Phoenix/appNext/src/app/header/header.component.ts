import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Output() sideMenuOpenChanged = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  onMenuOpenChange(e) {}

  onSideMenuOpenChanged(e) {
    this.sideMenuOpenChanged.next(true);
  }
}
