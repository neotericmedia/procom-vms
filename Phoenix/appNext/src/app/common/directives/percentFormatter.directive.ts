import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { pxPercentPipe } from '../pipes/pxPercent.pipe';

@Directive({ selector: '[phxPercentFormatter]' })
export class PercentFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private pxPercentPipe: pxPercentPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.pxPercentPipe.transform(this.el.value);
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value) {
    // this.el.value = this.pxPercentPipe.parse(value); // opossite of transform
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    if (value === '' || Number(value) > 100 || Number(value) < 0) { return; };
    this.el.value = Number(value).toFixed(4); ;
  }

}
