import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationBarItem } from '../../../common/model/navigation-bar-item';
import { PhxLocalizationService } from '../../../common/services/phx-localization.service';

import { PhxConstants } from '../../../common';

@Component({
  selector: 'app-time-sheet-tabs',
  templateUrl: './time-sheet-tabs.component.html',
  styleUrls: ['./time-sheet-tabs.component.less']
})
export class TimeSheetTabsComponent implements OnInit, OnChanges {
  @Input('hideProjectTab') hideProjectTab: boolean;
  @Input('timeSheetType') timeSheetType: number;
  private navigationBarItemList: NavigationBarItem[] = null;
  constructor(
    private router: Router,
    private localizationService: PhxLocalizationService
  ) {
  }

  ngOnInit() {
    this.getNavigationBar();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getNavigationBar();
  }

  // Icon: material icon name
  getNavigationBar() {
    this.navigationBarItemList = [
      {
        Id: 1,
        IsDefault: this.timeSheetType === PhxConstants.TimeSheetType.Manual,
        IsHidden: !(this.timeSheetType === PhxConstants.TimeSheetType.Manual),
        Name: 'time-card',
        Path: './',
        DisplayText: this.localizationService.translate('timesheet.header.timesheetNav'),
        Icon: 'access_time',
        SubMenu: []
      },
      {
        Id: 1,
        IsDefault: this.timeSheetType === PhxConstants.TimeSheetType.Imported,
        IsHidden: !(this.timeSheetType === PhxConstants.TimeSheetType.Imported),
        Name: 'imported',
        Path: './',
        DisplayText: this.localizationService.translate('timesheet.header.importedTimeSheet'),
        Icon: 'access_time',
        SubMenu: []
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Name: 'notes-attachments',
        Path: './notes-attachments',
        DisplayText: this.localizationService.translate('timesheet.header.notesAttachmentsNav'),
        Icon: 'note'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: this.hideProjectTab,
        Name: 'projects',
        Path: './projects',
        DisplayText: this.localizationService.translate('timesheet.header.projectsNav'),
        Icon: 'view_list'
      },
      /*{
        Id: 4,
        Name: 'allowance',
        Path: './allowance',
        DisplayText: 'Allowance',
        Icon: 'attach_money',
        IsDefault: false
      }*/
      {
        Id: 4,
        IsDefault: false,
        IsHidden: false,
        Name: 'history',
        Path: './history',
        DisplayText: this.localizationService.translate('timesheet.header.historyNav'),
        Icon: 'history'
      },
    ];
  }

}
