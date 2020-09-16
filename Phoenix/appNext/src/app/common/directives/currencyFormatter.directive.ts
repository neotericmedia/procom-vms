import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { pxCurrencyPipe } from '../pipes/pxCurrency.pipe';

@Directive({ selector: '[phxCurrencyFormatter]' })
export class CurrencyFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private pxCurrencyPipe: pxCurrencyPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.pxCurrencyPipe.transform(this.el.value);
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value) {
    this.el.value = this.pxCurrencyPipe.parse(value); // opossite of transform
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    this.el.value = this.pxCurrencyPipe.transform(value);
  }

}
