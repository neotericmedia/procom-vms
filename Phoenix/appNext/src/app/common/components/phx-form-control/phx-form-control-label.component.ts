import { Component, ElementRef, Input, EventEmitter, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { AbstractControl } from '@angular/forms';
import { FormControlExtensions } from './formcontrol.extensions';

@Component({
    selector: 'phx-form-control-label',
    templateUrl: './phx-form-control-label.component.html',
    styleUrls: ['./phx-form-control-label.component.less']
})
export class PhxFormControlLabelComponent implements OnInit {
    @Input() name: string;
    @Input() control: AbstractControl;
    @Input() enableAsterisk: boolean = true;
    @Input() showLabelAsHyperlink: boolean = false;

    @Output() click: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit(): void {
        this.name = this.name || FormControlExtensions.findControlName(this.control);
    }

    hasRequiredField() {
        return FormControlExtensions.hasRequiredField(this.control);
    }

    onClick() {
        this.click.emit();
    }
}

