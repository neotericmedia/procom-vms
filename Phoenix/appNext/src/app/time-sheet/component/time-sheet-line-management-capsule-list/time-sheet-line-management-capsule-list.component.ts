import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { TimeSheet, TimeSheetCapsuleSummary, TimeSheetLineManagementSortMode, TimeSheetCapsule } from '../../model';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';

@Component({
  selector: 'app-time-sheet-line-management-capsule-list',
  templateUrl: './time-sheet-line-management-capsule-list.component.html',
  styleUrls: ['./time-sheet-line-management-capsule-list.component.less']
})
export class TimeSheetLineManagementCapsuleListComponent implements OnInit, OnDestroy, OnChanges {

  _timeSheet: TimeSheet;
  get timeSheet() {
    return this._timeSheet;
  }

  @Input('timeSheet')
  set timeSheet(val: TimeSheet) {
    if (this._timeSheet !== val) {
      const old = this._timeSheet;
      this._timeSheet = val;

      if (val && (!old || (val.Id !== old.Id || val.IsEditable !== old.IsEditable))) {
        // re-calc summary list
        this.setSummaryList(false);
      } else {
        if (val && val.IsEditable) {
          this.updateSummaryTotals();
        }
      }
    }
  }

  @Input() capsuleList: TimeSheetCapsule[];

  @Input() sortMode: TimeSheetLineManagementSortMode;
  @Input() sortAsc: boolean;
  @Input() filter: string;

  @Input() editable: boolean;
  @Input() disabled: boolean;

  @Output() capsulePrefill: EventEmitter<{capsuleId: number, totalUnits: number}> = new EventEmitter<any>();
  @Output() capsuleClear: EventEmitter<number> = new EventEmitter<number>();
  @Output() capsuleRemove: EventEmitter<number> = new EventEmitter<number>();
  @Output() capsuleSpotlight: EventEmitter<number> = new EventEmitter<any>();
  @Output() capsuleClick: EventEmitter<TimeSheetCapsule> = new EventEmitter<TimeSheetCapsule>(); // TODO: refactor to pass guid (redux)

  private alive: boolean = true;

  summaryList: Array<TimeSheetCapsuleSummary> = [];

  constructor(
    private uiService: TimeSheetUiService
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.alive = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.capsuleList) {
      this.setSummaryList(false);
    }

    if (changes.sortMode || changes.sortAsc) {
      this.sortSummaryList();
    }

    if (changes.filter) {
      this.filterSummaryList();
    }
  }

  trackbyFn(index: number, capsuleSummary: TimeSheetCapsuleSummary) {
    const capsule = capsuleSummary ? capsuleSummary.capsule : null;
    return capsule ? capsule.guid + capsule.isActive : null;
  }

  setSummaryList(merge?: boolean) {
    if (this.capsuleList && this.timeSheet) {
      const existingList: TimeSheetCapsuleSummary[] = merge ? this.summaryList : null;

      this.summaryList = this.uiService.getTimeSheetCapsuleSummaryList(this.timeSheet, this.capsuleList, existingList);

      this.sortSummaryList();
      this.filterSummaryList();
    }
  }

  updateSummaryTotals() {
    for (const item of this.summaryList) {
      item.totalUnits = this.uiService.sumUnitsByCapsuleConfig(this.timeSheet, item.capsule);
    }
    if (this.sortMode === TimeSheetLineManagementSortMode.TotalUnits) {
      this.sortSummaryList();
    }
  }

  sortSummaryList() {
    this.uiService.sortTimeSheetCapsuleSummaryList(this.summaryList, this.sortMode, this.sortAsc);
  }

  filterSummaryList() {
    this.uiService.filterTimeSheetCapsuleSummaryList(this.summaryList, this.filter);
  }

  canDisplayCapsule(targetCapsule: TimeSheetCapsule) {
    return this.uiService.canDisplayCapsule(this.timeSheet, targetCapsule);
  }

  onPrefill(e) {
    this.capsulePrefill.emit(e);
  }

  onClear(e) {
    this.capsuleClear.emit(e);
  }

  onCapsuleRemove(capsuleGuid) {
    this.capsuleRemove.emit(capsuleGuid);
  }

  onSpotlight(e) {
    this.capsuleSpotlight.emit(e);
  }

  onCapsuleClick(e) {
    this.capsuleClick.emit(e);
  }
}
