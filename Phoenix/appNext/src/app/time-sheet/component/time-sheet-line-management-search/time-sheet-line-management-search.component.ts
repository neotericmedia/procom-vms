import { TimeSheetLineManagement, TimeSheetLineManagementSortMode } from './../../model/index';
import { TimeSheetService } from './../../service/time-sheet.service';
import { Component, OnInit, Input } from '@angular/core';
import { PhxLocalizationService } from '../../../common/services/phx-localization.service';

@Component({
  selector: 'app-time-sheet-line-management-search',
  templateUrl: './time-sheet-line-management-search.component.html',
  styleUrls: ['./time-sheet-line-management-search.component.less']
})
export class TimeSheetLineManagementSearchComponent implements OnInit {
  @Input() sortMode: TimeSheetLineManagementSortMode;
  @Input() sortAsc: boolean;
  @Input() filter: string;
  @Input() showSort: boolean = true;

  sortModes: {DisplayText: string, value: TimeSheetLineManagementSortMode}[] = [
    {
      DisplayText: 'timesheet.lineManagement.sortByProject',
      value: TimeSheetLineManagementSortMode.ProjectName
    },
    {
      DisplayText: 'timesheet.lineManagement.sortByTotal',
      value: TimeSheetLineManagementSortMode.TotalUnits
    }
  ];

  constructor(
    private timeSheetService: TimeSheetService,
    private localizationService: PhxLocalizationService
    ) { }

  ngOnInit() {
    this.applyLocalization();
  }

  updateSortMode(sortMode: TimeSheetLineManagementSortMode) {
    this.timeSheetService.setLineManagementSortMode(sortMode, this.sortAsc);
  }

  updateSortOrder(sortAsc: boolean) {
    this.timeSheetService.setLineManagementSortMode(this.sortMode, sortAsc);
  }

  filterCapsule(filterText: string) {

    const filter = filterText || '';

    this.timeSheetService.setLineManagementFilter(filter.trim());
  }

  applyLocalization() {
    for (const field of this.sortModes) {
      field.DisplayText = this.localizationService.translate(field.DisplayText);
    }
  }

}
