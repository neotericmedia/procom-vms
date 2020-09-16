import { ElementRef, AfterViewChecked, Input, HostListener, Directive } from '@angular/core';


@Directive({
    selector: '[phxEqualHeight]'
})
export class EqualHeightDirective implements AfterViewChecked {
    @Input() phxEqualHeight: any;

    constructor(private el: ElementRef) {
    }

    ngAfterViewChecked() {
        this.matchHeight(this.el.nativeElement, this.phxEqualHeight);
    }

    @HostListener('window:resize')
    onResize() {
        this.matchHeight(this.el.nativeElement, this.phxEqualHeight);
    }

    matchHeight(parent: HTMLElement, className: string) {
        if (!parent) {
            return;
        }
        const children = parent.getElementsByClassName(className);
        if (!children) {
            return;
        }
        Array.from(children).forEach((x: HTMLElement) => {
            x.style.height = 'initial';
        });
        const itemHeights = Array.from(children).map(x => x.getBoundingClientRect().height);
        const maxHeight = itemHeights.reduce((prev, curr) => { return curr > prev ? curr : prev; }, 0);
        Array.from(children).forEach((x: HTMLElement) => x.style.height = `${maxHeight}px`);
    }
}

