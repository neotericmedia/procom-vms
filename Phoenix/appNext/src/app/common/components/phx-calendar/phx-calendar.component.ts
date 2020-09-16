import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, Validator, NG_VALIDATORS, FormControl } from '@angular/forms';
import { DxCalendarComponent } from '../../../../../node_modules/devextreme-angular';
import * as moment from 'moment';

@Component({
  selector: 'app-phx-calendar',
  templateUrl: './phx-calendar.component.html',
  styleUrls: ['./phx-calendar.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PhxCalendarComponent)
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhxCalendarComponent),
      multi: true
    }
  ]
})
export class PhxCalendarComponent implements OnInit, ControlValueAccessor, Validator, AfterViewInit {
  cellTemplate = 'custom';
  @Input()
  min: any; // Date|Number|String
  @Input()
  max: any; // Date|Number|String
  @Input()
  disabled: boolean = false;
  @Input()
  readOnly: boolean = false;
  @Input()
  showTodayButton: boolean = false;
  @Input()
  rtlEnabled: boolean = false;
  @Input()
  width: any = '80%'; // "55px", "80%", "auto", "inherit"
  @Input()
  maxZoomLevel: string;
  @Input()
  minZoomLevel: string;

  @Output()
  valueChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  isValidChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('PhxCalendarComponent')
  dxCalendar: DxCalendarComponent;
  @ViewChild(PhxCalendarComponent)
  set content(content: DxCalendarComponent) {
    this.dxCalendar = content;
  }

  // tslint:disable-next-line:no-input-rename
  @Input('value')
  _value: any; // Date|Number|String

  validPickerTypes = ['calendar', 'list', 'native', 'rollers'];
  get value() {
    return this._value ? new Date(this._value) : null;
  }
  // Set in onValueChangedHandler because isValid doesn't update at the same time as value, only on emitValueChanged
  set value(val) {}

  constructor() {}

  ngOnInit() {}
  ngAfterViewInit(): void {
    const isValid = !this.dxCalendar || this.dxCalendar.isValid;
    this.isValidChange.emit(isValid);
  }
  writeValue(value: any) {
    if (this._value !== value) {
      this._value = value;
      this.onChange(value);
      this.onTouched();
    }
  }

  onChange = _ => {};

  onTouched = () => {};

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  onValueChangedHandler(event: any) {
    this.writeValue(event.value);
    this.valueChanged.emit(event);
  }

  validate(c: FormControl) {
    return !this.dxCalendar || this.dxCalendar.isValid
      ? null
      : {
          phxDateBox: {
            valid: false
          }
        };
  }

  isValidChangeHandler(event: any) {
    this.isValidChange.emit(event);
    // Trigger validation check if attached to ngModel
    this.onChange(this.value);
  }

  getCellCssClass(date) {
    const selectedDate = moment(this._value).format('YYYY-MM-DD');
    const currentDate = moment(date).format('YYYY-MM-DD');
    return moment(selectedDate).isSame(moment(currentDate)) ? 'active' : '';
  }
}
