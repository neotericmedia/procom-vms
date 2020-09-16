import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TimeSheetService } from '../../service/time-sheet.service';
import { StateService } from '../../../common/state/state.module';
import { ActivatedRoute } from '@angular/router';
import { TimeSheet, TimeSheetConfirmationMessage } from '../../model/index';
import { Subscription } from 'rxjs/Subscription';
import { DialogService, CommonService } from '../../../common/index';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';

@Component({
  selector: 'app-time-sheet-command-list',
  templateUrl: './time-sheet-command-list.component.html',
  styleUrls: ['./time-sheet-command-list.component.less']
})
export class TimeSheetCommandListComponent implements OnInit, OnDestroy, OnChanges {
  private alive: boolean = true;

  @Input() timeSheet: TimeSheet;
  isDetailsSavingSubscription: Subscription;
  isDetailsSaving: boolean = false;

  hasPrint = false;

  constructor(private timeSheetService: TimeSheetService, private uiService: TimeSheetUiService, private activatedRoute: ActivatedRoute, private dialogService: DialogService, private commonService: CommonService) {}

  ngOnInit() {
    this.isDetailsSavingSubscription = this.timeSheetService
      .isTimeSheetSaving()
      .takeWhile(() => this.alive)
      .subscribe(isDetailsSaving => {
        this.isDetailsSaving = isDetailsSaving;
      });

    this.hasPrint = this.timeSheet && this.timeSheet.AvailableStateActions && this.timeSheet.AvailableStateActions.find(x => x === this.commonService.ApplicationConstants.StateAction.TimesheetPrint) !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.timesheet) {
      // update has Print
      this.hasPrint = this.timeSheet && this.timeSheet.AvailableStateActions && this.timeSheet.AvailableStateActions.find(x => x === this.commonService.ApplicationConstants.StateAction.TimesheetPrint) !== null;
    }
  }

  clearTimeSheet() {
    const message = this.uiService.getMessage('clearAllCapsules');

    this.dialogService
      .confirm(message.title, message.body)
      .then(button => {
        this.timeSheetService.clearAllDetails(this.timeSheet);
      })
      .catch(e => {
        console.log(e);
      });
  }

  resetTimeSheet() {
    this.timeSheetService.getTimeSheetById(this.timeSheet.Id, null, true);
  }

  ngOnDestroy() {
    this.alive = false;
  }

  printTimeSheet() {
    this.timeSheetService.printTimeSheet(this.timeSheet);
    /* .then(
      (res) => {
        const fileURL = URL.createObjectURL(res);
        window.open(fileURL);
      }); */
  }
}
