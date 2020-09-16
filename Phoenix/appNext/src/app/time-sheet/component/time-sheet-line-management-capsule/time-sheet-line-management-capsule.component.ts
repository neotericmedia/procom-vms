import { trigger, state, style, transition, animate } from '@angular/animations';
import { DialogService } from './../../../common/services/dialog.service';
import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { TimeSheetService } from './../../service/time-sheet.service';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { TimeSheetCapsule, TimeSheet, UnitInput } from '../../model';
import { CommonService, PhxConstants } from '../../../common';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { TimeSheetUtil } from '../../time-sheet.util';

// Polyfill may be requried if slid animation accepted https://cdnjs.cloudflare.com/ajax/libs/web-animations/2.2.2/web-animations.min.js
@Component({
  selector: 'app-time-sheet-line-management-capsule',
  templateUrl: './time-sheet-line-management-capsule.component.html',
  styleUrls: ['./time-sheet-line-management-capsule.component.less'],
  animations: [
    trigger('infoSlide', [
      state(
        'show',
        style({
          transform: 'translate3d(0%, 0, 0)'
        })
      ),
      state(
        'hide',
        style({
          transform: 'translate3d(-100%, 0, 0)'
        })
      ),
      transition('show => hide', animate('300ms ease-in-out')),
      transition('hide => show', animate('400ms ease-in-out'))
    ]),
    trigger('preFillSlide', [
      state(
        'show',
        style({
          transform: 'translate3d(0%, 0, 0)'
        })
      ),
      state(
        'hide',
        style({
          transform: 'translate3d(100%, 0, 0)'
        })
      ),
      transition('show => hide', animate('300ms ease-in-out')),
      transition('hide => show', animate('400ms ease-in-out'))
    ])
  ]
})
export class TimeSheetLineManagementCapsuleComponent implements OnInit, OnChanges {
  @ViewChild('preFill')
  preFill: ElementRef;

  @Input()
  capsule: TimeSheetCapsule;
  @Input()
  totalUnits: number;
  @Input()
  editable: boolean;
  @Input()
  disabled: boolean;
  @Input()
  visible: boolean;
  @Input()
  timeSheet: TimeSheet;
  @Input()
  projectVersionId: number;

  @Output()
  prefill: EventEmitter<{ guid: string; prefill: number }> = new EventEmitter<{ guid: string; prefill: number }>();
  @Output()
  clear: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  capsuleRemove: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  spotlight: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  capsuleClick: EventEmitter<TimeSheetCapsule> = new EventEmitter<TimeSheetCapsule>(); // TODO: refactor to pass guid (redux)

  projectName: string;
  style: { [key: string]: string };
  unitInputProperties: UnitInput = { max: 0, min: 0, step: 0 };

  private clearTxt: string;
  private removeTxt: string;
  clearBtnTooltip: string;

  constructor(
    private commonService: CommonService, 
    private uiService: TimeSheetUiService, 
    private timeSheetService: TimeSheetService, 
    private dialogService: DialogService,
    protected localizationService: PhxLocalizationService,
    ) {
      this.clearTxt = this.localizationService.translate('common.generic.clear');
      this.removeTxt = this.localizationService.translate('common.generic.remove');
    }

  ngOnInit() {
    TimeSheetUtil.calculateMaxMinAndStepForUnitInputByRateUnit(this.capsule.timeSheetDetail.RateUnitId, this.unitInputProperties);
  }

  ngOnChanges(changes: SimpleChanges) {
    // this should be fine, capsules don't get updated
    if (changes && changes.capsule) {
      this.style = this.uiService.getLineManagementStyle(this.capsule);
    }
    if (changes && (changes.capsule || changes.projectVersionId)) {
      this.projectName = this.uiService.getCapsuleProjectName(this.capsule, this.projectVersionId);
    }
    if (changes && changes.hasOwnProperty('totalUnits')) {
      this.clearBtnTooltip = this.totalUnits === 0 ? this.removeTxt : this.clearTxt;
    }
  }

  onClear() {
    if (this.totalUnits > 0) {
      this.onClearTimesheet();
    } else {
      this.onClearProjectRateList();
    }
  }

  onClearProjectRateList() {
    const message = this.uiService.getMessage('clearCapsuleTypeFromList');

    this.dialogService
      .confirm(message.title, message.body)
      .then(button => {
        this.capsuleRemove.emit(this.capsule.guid);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onClearTimesheet() {
    const message = this.uiService.getMessage('clearCapsuleType');

    this.dialogService
      .confirm(message.title, message.body)
      .then(button => {
        this.timeSheetService.clearTimeSheetDetailsByCapsule(this.timeSheet, this.capsule);
        this.clear.emit(this.capsule.guid);
      })
      .catch(e => {
        console.log(e);
      });
  }

  toggleQuickFill() {
    this.capsule.preFillSlideState = this.capsule.preFillSlideState === 'hide' ? 'show' : 'hide';
    this.capsule.infoSlideState = this.capsule.infoSlideState === 'hide' ? 'show' : 'hide';
  }

  setCapsuleQuickFillUnits(units: number): void {
    this.capsule.preFill = Number(units);
  }

  getIncrementAmount() {
    return this.capsule.timeSheetDetail.RateUnitId === PhxConstants.RateUnit.Hour ? 0.25 : 1;
  }

  incrementCapsuleQuickFillUnits(): void {
    const increment = this.getIncrementAmount();

    const result = Number(this.capsule.preFill) + increment;

    if (result <= this.unitInputProperties.max) {
      this.capsule.preFill = result;
    }
  }

  decrementCapsuleQuickFillUnits(): void {
    const increment = this.getIncrementAmount();

    const result = Number(this.capsule.preFill) - increment;

    if (result >= this.unitInputProperties.min) {
      this.capsule.preFill = result;
    }
  }

  onPrefill() {
    const prefillAmt: number = this.capsule.preFill;
    this.timeSheetService.quickFillDayCapusules(this.timeSheet, this.capsule);
    this.capsule.preFill = 0;
    this.capsule.preFillSlideState = 'hide';
    this.capsule.infoSlideState = 'show';
    this.prefill.emit({ guid: this.capsule.guid, prefill: prefillAmt });
  }

  goToPrefill() {
    let prefillAmt = 0;

    if (this.capsule.timeSheetDetail.RateTypeId === PhxConstants.RateType.Primary && this.capsule.timeSheetDetail.Project == null) {
      if (this.capsule.timeSheetDetail.RateUnitId === PhxConstants.RateUnit.Day) {
        prefillAmt = 1;
      } else if (this.capsule.timeSheetDetail.RateUnitId === PhxConstants.RateUnit.Hour) {
        prefillAmt = this.timeSheet.HoursPerDay;
      }
    }

    this.capsule.preFill = prefillAmt;
    this.capsule.preFillSlideState = 'show';
    this.capsule.infoSlideState = 'hide';
    setTimeout(() => {
      (<HTMLInputElement>this.preFill.nativeElement).select();
    }, 0); // letting the rendering thread to catch up, so that the textbox will be populated with the prefillAmt before making it in selected mode.
  }

  onSpotlight() {
    this.timeSheetService.setSpotLightCapsuleConfig(this.capsule.timeSheetDetail.RateTypeId, this.capsule.timeSheetDetail.ProjectId, this.timeSheet.Id);
    this.spotlight.emit(this.capsule.guid);
  }

  onClick() {
    this.capsuleClick.emit(this.capsule);
  }
}
