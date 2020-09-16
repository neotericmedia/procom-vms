import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, Validator, NG_VALIDATORS, FormControl } from '@angular/forms';
import { DxDateBoxComponent } from '../../../../../node_modules/devextreme-angular';

@Component({
  selector: 'app-phx-date-box',
  templateUrl: './phx-date-box.component.html',
  styleUrls: ['./phx-date-box.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PhxDateBoxComponent)
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhxDateBoxComponent),
      multi: true
    }
  ]
})
export class PhxDateBoxComponent implements OnInit, ControlValueAccessor, Validator, AfterViewInit {
  @Input() type: string = 'date'; // 'date' | 'time' | 'datetime'
  @Input() min: any; // Date|Number|String
  @Input() max: any; // Date|Number|String
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() showClearButton: boolean = false;
  @Input() width: any = 'auto'; // "55px", "80%", "auto", "inherit"
  @Input() displayFormat: string;
  @Input() maxZoomLevel: string;
  @Input() minZoomLevel: string;
  @Input() interval: string;
  @Input() pickerType: string; // calender|list|native|rollers, default: calender, native (mobile)
  @Input() allowUserInput: boolean = true;

  @Input() resetInvalidValueOnOpen: boolean = true;

  @Output() onValueChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() isValidChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closed: EventEmitter<any> = new EventEmitter<any>();
  @Output() opened: EventEmitter<any> = new EventEmitter<any>();

  private dxDateBox: DxDateBoxComponent;
  @ViewChild(DxDateBoxComponent)
  set content(content: DxDateBoxComponent) {
    this.dxDateBox = content;
  }

  // tslint:disable-next-line:no-input-rename
  @Input('value') _value: any; // Date|Number|String

  validPickerTypes = ['calendar', 'list', 'native', 'rollers'];
  get value() {
    return this._value;
  }
  // Set in onValueChangedHandler because isValid doesn't update at the same time as value, only on emitValueChanged
  set value(val) { }

  constructor() {
    if (this.pickerType && !this.validPickerTypes.includes(this.pickerType)) {
      throw new Error('Invalid initialization. "pickerType" is invalid.');
    }
  }

  ngOnInit() { }
  ngAfterViewInit(): void {
    const isValid = !this.dxDateBox || this.dxDateBox.isValid;
    this.isValidChange.emit(isValid);
  }
  writeValue(value: any) {
    if (this._value !== value) {
      this._value = value;
      this.onChange(value);
      this.onTouched();
    }
  }

  onChange = _ => { };

  onTouched = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  focusIn() {
    this.dxDateBox.instance.open();
  }

  focusOut() {
    this.dxDateBox.instance.close();
  }

  onValueChangedHandler(event: any) {
    this.writeValue(event.value);
    this.onValueChanged.emit(event);
  }

  closedHandler(event: any) {
    this.closed.emit(event);
  }

  openedHandler(event: any) {
    if (this.resetInvalidValueOnOpen && !this.dxDateBox.isValid) {
      this.dxDateBox.instance.reset();
    }
    this.opened.emit(event);
  }

  validate(c: FormControl) {
    return !this.dxDateBox || this.dxDateBox.isValid
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
}
