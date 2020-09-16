// Tab Head Item
import { NavigationBarSubItem } from './../../model/navigation-bar-sub-item';
import { NavigationBarItem } from './../../model/navigation-bar-item';
import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-phx-navigation-bar',
  templateUrl: './phx-navigation-bar.component.html',
  styleUrls: ['./phx-navigation-bar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhxNavigationBarComponent implements OnInit, OnChanges {
  @Input() activeTab: NavigationBarItem;
  @Input() activeSubMenu: NavigationBarSubItem;
  @Input() navigationBarContent: Array<NavigationBarItem>;
  @Input() url: string;
  @Output() onTabSelected: EventEmitter<NavigationBarItem> = new EventEmitter();

  constructor(private chRef: ChangeDetectorRef) { }

  ngOnInit() { }

  onTabSelect(tab: NavigationBarItem) {
    this.activeTab = tab;
    this.onTabSelected.emit(tab);
  }

  onSubMenuSelect(subMenu: any) {
    this.activeSubMenu = subMenu;
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['navigationBarContent'] && changes['navigationBarContent'].currentValue) {
      this.navigationBarContent = changes['navigationBarContent'].currentValue;
    }
    if (this.navigationBarContent) {
      if (changes['url'] && changes['url'].currentValue) {
        this.url = changes['url'].currentValue;
      }
      if (this.url) {
        const tabItem = this.navigationBarContent.find(nbc => this.url.includes(nbc.Name));
        this.activeTab = tabItem ? tabItem : this.navigationBarContent.filter(item => item.IsDefault === true)[0];
        if (this.activeTab.SubMenu !== undefined && this.activeTab.SubMenu.length > 0) {
          this.activeSubMenu = this.activeTab.SubMenu.filter(item => item.IsDefault === true)[0];
        }
        if (this.activeTab) {
          this.onTabSelected.emit(this.activeTab);
        }
      }
    }
  }

  repaint() {
    if (this.navigationBarContent) {
      if (this.url) {
        console.log('Navigation bar repainted');
        const that = this;
        const tabItem = this.navigationBarContent.find(nbc => that.url.includes(nbc.Name));
        this.activeTab = tabItem ? tabItem : this.navigationBarContent.filter(item => item.IsDefault === true)[0];
        this.chRef.detectChanges();
      }
    }
  }
}
