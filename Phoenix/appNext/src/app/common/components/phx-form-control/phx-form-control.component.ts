import { Component, ElementRef, Input, EventEmitter, Optional, OnInit, Output } from '@angular/core';
import { UtilityService } from './../../services/utility-service.service';
import * as moment from 'moment';
import { AbstractControl } from '@angular/forms';
import { FormControlExtensions } from './formcontrol.extensions';
import { PhxFormControlLayoutType } from '../../model/index';

@Component({
    selector: 'phx-form-control',
    templateUrl: './phx-form-control.component.html',
    styleUrls: ['./phx-form-control.component.less']
})

export class PhxFormControlComponent implements OnInit {

    @Input() control: AbstractControl;
    @Input() name: string;
    @Input() labelText: string;
    @Input() showValidationMessages: boolean = false;
    @Input() forceValidation: boolean = false;
    @Input() editable: boolean = true;
    @Input() viewModeText: string;
    @Input() layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.Responsive;
    @Input() enableLabelAsterisk: boolean = true;
    @Input() showLabelAsHyperlink: boolean = false;

    @Output() labelClick: EventEmitter<any> = new EventEmitter<any>();

    PhxFormControlLayoutType: typeof PhxFormControlLayoutType = PhxFormControlLayoutType;


    constructor() {
    }

    ngOnInit(): void {
        this.name = this.name || FormControlExtensions.findControlName(this.control);

        if (this.labelText && !this.name) {
            throw new Error('Invalid initialization. Need `name` and `labelText`.');
        }
    }

    onLabelClick() {
        this.labelClick.emit();
    }
}
