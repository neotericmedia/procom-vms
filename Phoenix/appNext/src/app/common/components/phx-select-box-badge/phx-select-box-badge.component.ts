import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-phx-select-box-badge',
  templateUrl: './phx-select-box-badge.component.html',
  styleUrls: ['./phx-select-box-badge.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PhxSelectBoxBadgeComponent),
    }
  ]
})
export class PhxSelectBoxBadgeComponent implements ControlValueAccessor {

  @Input() items: any;
  @Input() placeholder: string;
  @Input() showClearButton: boolean = true;
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() textField: string;
  @Input() valueField: string;
  @Input() badgeField: string;
  @Input() badgeCssClass: string = 'badge-warning';
  @Input() width: any; // "55px", "80%", "auto", "inherit" (default = undefined )

  // tslint:disable-next-line:no-input-rename
  @Input('value') _value: any;
  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  constructor() { }

  writeValue(value: any) {
    this.value = value;
  }

  onChange = (_) => { };

  onTouched = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  onValueChanged(event: any) {
    this.value = event.value;
    this.valueChanged.emit(event);
  }

}
