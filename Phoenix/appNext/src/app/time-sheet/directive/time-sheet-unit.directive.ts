import { Directive, ElementRef, OnInit, HostListener, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl } from '@angular/forms';

@Directive({
  selector: '[timeSheetUnit]'
})
export class TimeSheetUnitDirective implements OnInit {
  private inputBox: HTMLInputElement;
  private currentValue: number;
  @Input()
  control: FormControl;
  @Input()
  max = 24;
  @Input()
  min = 0.1;

  constructor(private decimalPipe: DecimalPipe, private elementRef: ElementRef) {
    this.inputBox = this.elementRef.nativeElement;
  }

  ngOnInit() {
    const newValue = this.inputBox.value || 0;
    this.currentValue = Number(newValue);
    this.inputBox.value = this.decimalPipe.transform(this.currentValue, '1.2-2');
  }

  @HostListener('click')
  onClick() {
    this.inputBox.select();
  }

  @HostListener('change', ['$event.target.value'])
  onChange(value) {
    this.parseInput(value);
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    this.parseInput(value);
  }

  private parseInput(value) {
    let newValue = value ? value.toString() : '';
    let newValueNum = Number(newValue);

    // trim and reset if decimal with over two places
    if (newValue.match(/^\d*(\.\d{3,})?$/)) {
      newValue = newValueNum.toFixed(2);
      newValueNum = Number(newValue);
    }

    if (newValue.match(/^\d*(\.\d{0,2})?$/) && !newValue.match(/[^0-9.]/) && newValueNum >= this.min && newValueNum <= this.max) {
      this.currentValue = newValueNum;
    }

    // if there is a form control, set its value to clear validation errors;
    if (this.control) {
      this.control.setValue(this.decimalPipe.transform(this.currentValue, '1.2-2'));
    } else {
      this.inputBox.value = this.decimalPipe.transform(this.currentValue, '1.2-2');
    }
  }
}
