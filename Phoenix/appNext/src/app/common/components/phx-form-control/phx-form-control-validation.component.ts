import { Component, ElementRef, Input, EventEmitter, OnInit, Optional } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ISubscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import { ValidationMessagesConfiguration, defaultConfig } from './config';
import { MessageProvider } from './message-provider';
import { PhxLocalizationService } from '../../index';

@Component({
    selector: 'phx-form-control-validation',
    templateUrl: './phx-form-control-validation.component.html',
    styleUrls: ['./phx-form-control-validation.component.less']
})
export class PhxFormControlValidationComponent implements OnInit {
    // @Input() errorDefs: any;
    @Input() control: AbstractControl;
    @Input() class: string;

    config: ValidationMessagesConfiguration;
    messageProvider: MessageProvider;

    // public errorMessage: string = '';
    private statusSubscription: ISubscription;

    constructor(
        @Optional() private customConfig: ValidationMessagesConfiguration,
        private localizationService: PhxLocalizationService
    ) {

        this.config = Object.assign({}, defaultConfig);

        Object.keys(defaultConfig.defaultErrorMessages).map( (key, index) => {
            defaultConfig.defaultErrorMessages[key] = this.localizationService.translate(defaultConfig.defaultErrorMessages[key]);
        });

        if (customConfig && customConfig.defaultErrorMessages) {
            this.config = {
                ...defaultConfig,
                ...customConfig,
                defaultErrorMessages: {
                    ...defaultConfig.defaultErrorMessages,
                    ...customConfig.defaultErrorMessages
                }
            };
        }

        const errorMessages = Object.assign({}, defaultConfig.defaultErrorMessages, this.config.defaultErrorMessages);
        this.messageProvider = new MessageProvider(errorMessages);
    }

    ngOnInit(): void {
        // this.statusSubscription = this.control.statusChanges.subscribe(() => {
        //     this.errorMessage = '';
        //     if (this.control && this.control.errors) {
        //         Object.keys(this.errorDefs).some(key => {
        //             if (this.control.errors[key]) {
        //                 this.errorMessage += this.errorDefs[key];
        //                 return true;
        //             }
        //         });
        //     }
        // });
        this._mergeWithLocalConfiguration();
    }

    get errorMessage(): string {
        if (this.control) {
            for (const errorPropertyName in this.control.errors) {
                if (this.control.errors.hasOwnProperty(errorPropertyName)) {
                    return this.messageProvider.getErrorMessage(errorPropertyName, this.control.errors[errorPropertyName]);
                }
            }
        }

        return null;
    }

    /**
     * Merge instance specific configuration with the default and/or custom one.
     */
    private _mergeWithLocalConfiguration(): void {
        if (this.class) {
            this.config.class = this.class;
        }
    }

    // ngOnChanges(changes: SimpleChanges): void {
    //     const control: FormControl = changes.control.currentValue;
    //     this.errorMessage = '';
    //     if (control && control.errors) {
    //         Object.keys(this.errorDefs).some(key => {
    //             if (control.errors[key]) {
    //                 this.errorMessage += this.errorDefs[key];
    //                 return true;
    //             }
    //         });
    //     }
    // }
}
