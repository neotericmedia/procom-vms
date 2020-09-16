import { ModalDatePickerData } from './../../model/modal-date-picker-data';
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-phx-modal-date-picker',
  templateUrl: './phx-modal-date-picker.component.html',
  styleUrls: ['./phx-modal-date-picker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhxModalDatePickerComponent implements OnInit {
  @ViewChild('datepickerModal') datepickerModal: any;

  @Input() dataModel: ModalDatePickerData;
  @Input() showBackButton: boolean;

  @Output() onDateSelected = new EventEmitter<Date>();
  @Output() back = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {
    if (!this.dataModel) {
      throw new Error('Invalid initialization. "dataModel" is required.');
    }
  }

  showModal() {
    this.datepickerModal.show();
  }

  hideModal() {
    this.datepickerModal.hide();
  }

  onSelection($event) {
    this.onDateSelected.emit($event);
    this.hideModal();
  }

  onBack() {
    this.back.emit(null);
    this.hideModal();
  }

  get getHighlightedDates(): Array<object> {
    const customCss = Array<object>();

    if (this.dataModel.HighlightedDates !== undefined) {
      const totalDays = this.dataModel.HighlightedDates.length;
      for (let index = 0; index < totalDays; index++) {
        const cssClass = 'highlight-day';

        /*if (totalDays === 1) {
          cssClass = 'highlight-day-single';
        } else {
          if (index === 0) {
            cssClass = 'highlight-day-start';
          } else if (index === totalDays - 1) {
            cssClass = 'highlight-day-end';
          }
        }*/

        customCss.push({
          'date': this.dataModel.HighlightedDates[index],
          'mode': 'day',
          'clazz': cssClass
        });
      }

      return customCss;
    }
  }

  isHighlightedDate(date: Date): boolean {
    if (this.dataModel.HighlightedDates) {
      return this.dataModel.HighlightedDates.some((d: Date) => d.getTime() === date.getTime());
    } else {
      return false;
    }
  }
}
