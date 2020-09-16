import { Directive, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgControl, NgModel } from '@angular/forms';

@Directive({
    selector: '[ngModel][phxDebounce]',
})
export class DebounceDirective implements OnInit {
    @Output()
    public onDebounce = new EventEmitter<any>();

    // tslint:disable-next-line:no-input-rename
    @Input('phxDebounce') public debounce = 500;

    private isFirstChange = true;

    constructor(public model: NgControl) {
    }

    ngOnInit() {
        this.model.valueChanges
            .debounceTime(this.debounce)
            .distinctUntilChanged()
            .subscribe(modelValue => {
                if (this.isFirstChange) {
                    this.isFirstChange = false;
                } else {
                    this.onDebounce.emit(modelValue);
                }
            });
    }
}
