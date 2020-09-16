import { Directive, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

@Directive({
  selector: '[phxEllipsisTip]'
})
export class EllipsisTipDirective implements AfterViewInit, OnChanges {

  ngOnChanges(changes: SimpleChanges): void {
    this.el.title = +(this.el.offsetWidth) > parseFloat(this.phxEllipsisTip) ? this.el.innerText : '';
  }


  @Input('phxEllipsisTip') phxEllipsisTip: string;

  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.el.title = +(this.el.offsetWidth) > parseFloat(this.phxEllipsisTip) ? this.el.innerText : '';
  }

}
