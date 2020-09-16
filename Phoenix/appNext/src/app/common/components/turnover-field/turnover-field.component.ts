import { Component, ElementRef, Input, HostListener, EventEmitter, Output, SimpleChanges,
     ViewContainerRef, ComponentFactoryResolver, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { JsConvertedJqueryService } from './../../services/js.converted.jquery.service';
import { TurnoverFieldHelperService } from './services/turnover-field-helper-service';
import { CheckViewStatus } from './interfaces/turnoverFieldCheckStatus';
// import { LookupNoCachePipe } from '../../../common/pipes/lookUpNoCache';

// How component is used in angualrjs2
// <input class="form-control ng-scope" type="text" placeholder="Description" name="Description"
//                   required="required" minlength="3" min="3" maxlength="255" max="255"
//                   (TFEventfuncToCheckViewStatus)='funcToCheckViewStatus($event)' 
//                   (TFEventfuncToPassMessages)='funcToPassMessages($event)'
//                   [(ngModel)]="entity.Description" turnover-field="'entity.Description'"
//                   tf-WatchChangeEvent="{{[localEvents.isEdit]}}"
//                   tf-fieldViewCustom="{{billingInfo | currency:'USD':true}}"
//                   float-between-input="{from:0, to:100, decimalplaces:2, doesemptytozero:'false'}" >

// turnoverField Input - Takes in a string literal that is of the compiled one found within ngModel.
//                       Look at this for example [(ngModel)]="entity.Description" turnover-field="'entity.Description'"

// name Input - is only used for output message back to parent component

// optionsAttr Input - if the element tag name is a checkbox or input radio,
//                      then options will be used by lookupNoCache pipe

// ngModelAttrValue Input - ngModel value

// modelPrefix Input - Input as String literal that is send to Parent during emit call of funcToCheckViewStatus.

// fieldViewCustom Input - as the name implies, makes a custom input to superseed as being the compiled input.

// classOnView Input - add custom class

// watchChangeEvent Input - Track's changes of values, can be given as an array {{[Somevalue, someOtherValue]}}
//                          Upon the such, re-trigger the function that may lead to second look at what is compiled.

// modelValidation Input - Similar to modelPrefix, only used as a parameters upon making an emit call to parent component.

// inputAttrValue Input - Meant to be a replacement to using NgModel.

        // Sample for parent component to contain.

        // private TFConstants = {
        //     edit: 0,
        //     view: 1,
        //     hideElement: 2,
        //     hideFormGroup: 3
        // };

        // this.TurnoverFieldHelperService.postTFConstants(this.TFConstants);

        // funcToCheckViewStatus(CheckViewStatus: CheckViewStatus): void {
        //         const fieldName = CheckViewStatus.fieldName;
        //         const modelPrefix = CheckViewStatus.modelPrefix;
        //         const modelValidation = CheckViewStatus.modelValidation;
        //         let viewStatus = null;
        //         if (this.localEvents.isEdit) {
        //             viewStatus = this.TFConstants.edit;
        //         } else {
        //             viewStatus = this.TFConstants.view;
        //         }
        //         // the following is required, otherwise the view will not be updated
        //         CheckViewStatus.directiveObj.checkViewStatusHelper(viewStatus);
        //         this.changeDetectorRef.detectChanges();
        //     }

        //     funcToPassMessages(msg: string): void {
        //         console.log(msg);
        //     }

@Component({
  selector: '[turnover-field]',
  templateUrl: './turnover-field.component.html'
})

export class TurnoverFieldComponent implements OnInit {
    @Input('turnover-field') turnoverField: any;
    @Input('name') name: string;
    @Input('tf-Options') optionsAttr: string;
    @Input('ngModel') ngModelAttrValue: any;
    @Input('tf-ModelPrefix') modelPrefix: any;
    @Input('tf-FieldViewCustom') fieldViewCustom: any;
    @Input('tf-ClassOnView') classOnView: any;
    @Input('tf-WatchChangeEvent') watchChangeEvent: any;
    @Input('tf-ModelValidation') modelValidation: any;
    @Input('tf-InputValue') inputAttrValue: any;

    private fieldViewElement: any;
    private elementAttr: any;
    private ApplicationConstants: any = {};
    private dontRestart: any = false;
    private allowMakingTemplates: any = true;
    private datepickerPopup: any = null;
    private repeatOuterHTML: any = null;
    private moveUpwardsCount: any = 1;
    private returnOnViewStatus: any;
    private inputValue: any;

    private htmlResult: any = {};
    private show: any =
    {
        showNodeSelect: false,
        showNodeTextCurrency: false,
        showNodeTextCurrency2Decimals: false,
        showNodeTextCurrency4Decimals: false,
        showNodeTextOrDate: false,
        showNodeRadio: false,
        showNodeDatePicker: false,
        ngClassShow: false,
        showResultHtml: false,
        showSpan: false,
        showEmptySpan: false
    };
    private resultSelect: any = { html: '' };
    public showObj: any = {
        showTemplate1: false,
        showTemplate2: false
    };

    @Output() TFEventfuncToCheckViewStatus: EventEmitter<CheckViewStatus> = new EventEmitter<CheckViewStatus>();
    @Output() TFEventfuncToPassMessages: EventEmitter<string> = new EventEmitter<string>();

    constructor(private elRef: ElementRef,
     private JsConvertedJqueryService: JsConvertedJqueryService,
     private componentFactoryResolver: ComponentFactoryResolver,
     private TurnoverFieldHelperService: TurnoverFieldHelperService) {
        this.fieldViewElement = this.elRef.nativeElement;
    }

    ngOnInit(): void {
        if (this.dontRestart === false) { 
            this.dontRestart = true;
            this.inputValue = (typeof this.inputAttrValue !== 'undefined') ? this.inputAttrValue : this.ngModelAttrValue;

            this.getElementAttributes();

            // ApplicationConstants
            this.ApplicationConstants.viewStatuses = this.TurnoverFieldHelperService.getTFConstants();

            this.checkViewStatus();
        }
    }

    getElementAttributes(): void {
        // get element attribute 'ngModel'
        // if (this.inputValue && this.inputValue.length > 0) {
        //     this.elementAttr.ngModel = this.inputValue;
        // }

        // get element attribute 'name'
        if (this.name && this.name.length > 0) {
            // this.elementAttr.name = this.name;
        } else if (this.inputValue && this.inputValue.length > 0) {
            this.name = (this.inputValue.indexOf('.') >= 0) ? this.inputValue.substring(this.inputValue.lastIndexOf('.') + '.'.length) : '';
        }

        // get element attribute 'modelPrefix'
        if (this.modelPrefix && this.modelPrefix.length > 0) {
            // this.elementAttr.modelPrefix = this.modelPrefix;
        } else if (this.inputValue && this.inputValue.length > 0 && this.turnoverField && this.turnoverField.length > 0) {
            this.modelPrefix = (this.turnoverField.indexOf('.') > 0) ? this.turnoverField.substring(0, this.turnoverField.lastIndexOf('.')) : '';
        }
        // classOnView default value
        if (!this.classOnView || this.classOnView.length === 0) {
            this.classOnView = 'form-control-static';
        }
        // if (this.modelValidation = null ) {
        //     this.elementAttr.modelValidation = this.modelValidation;
        // }

        // get element attribute 'fieldViewCustom'
        // if (typeof this.fieldViewCustom != 'undefined' && this.fieldViewCustom.length > 0) {
            // Why?
            // if (this.EventfuncToPassMessages && (this.fieldViewCustom.indexOf('{ {') < 0 ||
            //  this.fieldViewCustom.indexOf('} }') < 0 || this.fieldViewCustom.indexOf('{{') >= 0 ||
            //   this.fieldViewCustom.indexOf('}}') >= 0)) {
            //     var message = 'the attribute "fieldViewCustom" of directive "ptFieldView" of HTML element name="'
            //      + this.name + '", ngModel="' + this.inputValue + '" should include brackeds with space inside "{ {...} }"';
            //     this.EventfuncToPassMessages.emit(message);
            // }
            // this.fieldViewCustom = this.fieldViewCustom.replace(new RegExp("{ {", 'g'), "{{");
            // this.fieldViewCustom = this.fieldViewCustom.replace(new RegExp("} }", 'g'), "}}");
        // }
    };

    get_html_select(inputElement: any): void {
        const inputNode = inputElement;
        const resultSelect = { html: '', ngClass: '' };
        if (inputNode.outerHTML.indexOf('ngRepeat') > 0) {
            resultSelect.html = inputNode.outerHTML.substring(inputNode.outerHTML.indexOf('ngRepeat'));
            if (resultSelect.html.indexOf(' in ') > 0) {
                resultSelect.html = resultSelect.html.substring(resultSelect.html.indexOf(' in ') + ' in '.length);
                if (resultSelect.html.indexOf(' ') > 0) {
                    resultSelect.html = resultSelect.html.substring(0, resultSelect.html.indexOf(' '));
                    // resultSelect.html = '{{' + this.inputValue + ' | lookupNoCache:' + resultSelect.html + '}}&nbsp;';
                    this.resultSelect = resultSelect.html;
                    this.show.showNodeSelect = true;
                }
            }
        }
        // return resultSelect;
    };

    get_html_input_text(inputElement: any): void {
        const inputNode = inputElement;
        // var resultInputText = { html: '', ngClass: '' };
        if (inputNode.outerHTML.indexOf('uib-datepicker-popup') >= 0) {
            this.get_date_picker(inputElement);
        } else if (inputNode.outerHTML.indexOf('decimalplaces="2"') >= 0) {
            // resultInputText.html = '{{' + this.inputValue + '|currency:""}}&nbsp;';
            this.show.showNodeTextCurrency = true;
        } else if (inputNode.outerHTML.indexOf('decimalplaces:2') >= 0) {
            // resultInputText.html = '{{' + this.inputValue + '|currency:"":2}}&nbsp;';
            this.show.showNodeTextCurrency2Decimals = true;
        } else if (inputNode.outerHTML.indexOf('decimalplaces:4') >= 0) {
            // resultInputText.html = '{{' + this.inputValue + '|currency:"":4}}&nbsp;';
            this.show.showNodeTextCurrency4Decimals = true;
        } else {
            // resultInputText.html = '{{' + this.inputValue + '}}&nbsp;';
            this.show.showNodeTextOrDate = true;
        }
        // return resultInputText;
    };

    get_html_input_checkbox(inputElement: any): void {
        // var resultInputCheckbox = { span: '', html: '', ngClass: '' };
        if (this.optionsAttr && this.optionsAttr.length > 0) {
            // resultInputCheckbox.span = '{{' + this.inputValue + ' | lookupNoCache:' + this.optionsAttr + ':"key":"value"}}&nbsp;';
            this.show.showSpan = true;
        } else {
            // resultInputCheckbox.span = '  ';
            this.show.showEmptySpan = true;
            // resultInputCheckbox.ngClass = '{{'+ this.inputValue+'?\'fontello-icon-ok-circled2\':\'fontello-icon-cancel-circled2\'}}';

            // resultInputCheckbox.ngClass = '{{' + this.inputValue + '?\'fontello-icon-check\':\'fontello-icon-check-empty\'}}';
            this.show.ngClassShow = true;
        }
        // return resultInputCheckbox;
    };

    get_input_radio(inputElement: any): void {
        // var resultInputRadio = { html: '', ngClass: '' };
        if (this.optionsAttr && this.optionsAttr.length > 0) {
            // resultInputRadio.html = '{{' + this.inputValue + ' | lookupNoCache:' + this.optionsAttr + ':"key":"value"}}';
            this.show.showNodeRadio = true;
        }
        // return resultInputRadio;
    };

    get_date_picker(inputElement: any): void {
        // var resultDatePicker = { html: '', ngClass: '' };
        const inputNode = inputElement;
        if (inputNode.outerHTML.indexOf('uib-datepicker-popup') >= 0) {
            let datepickerPopup = inputNode.outerHTML.substring(inputNode.outerHTML.indexOf('uib-datepicker-popup="') + 'uib-datepicker-popup="'.length);
            if (datepickerPopup.indexOf('"') >= 0) {
                datepickerPopup = datepickerPopup.substring(0, datepickerPopup.indexOf('"'));
                if (datepickerPopup.indexOf('{{') >= 0 && datepickerPopup.indexOf('}}')) {
                    datepickerPopup = datepickerPopup.substring(datepickerPopup.indexOf('{{') + '{{'.length);
                    datepickerPopup = datepickerPopup.substring(0, datepickerPopup.indexOf('}}'));
                    // resultDatePicker.html = '{{' + this.inputValue + '|date:' + datepickerPopup + '}}&nbsp;';
                } else {
                    // resultDatePicker.html = '{{' + this.inputValue + '|date:"' + datepickerPopup + '"}}&nbsp;';
                }
                this.show.showNodeDatePicker = true;
                this.datepickerPopup = datepickerPopup;
            }
        } else {
            // resultDatePicker.html = '{{' + this.inputValue + '}}&nbsp;';
            this.show.showNodeTextOrDate = true;
        }
        // return resultDatePicker;
    };

    get_ui_select_bootstrap(inputElement: any): void {
        // var resulUiSelectBootstrap = { html: '', ngClass: '' };
        const inputNode = inputElement;
        const repeat = inputNode.find('[repeat]');
        if (repeat && repeat[0] && repeat[0].outerHTML.length > 0) {
            let repeatOuterHTML = repeat[0].outerHTML.substring(repeat[0].outerHTML.indexOf('repeat'));
            if (repeatOuterHTML.indexOf(' in ') > 0) {
                repeatOuterHTML = repeatOuterHTML.substring(repeatOuterHTML.indexOf(' in ') + ' in '.length);
                if (repeatOuterHTML.indexOf(' ') > 0) {
                    repeatOuterHTML = repeatOuterHTML.substring(0, repeatOuterHTML.indexOf(' '));
                    // resulUiSelectBootstrap.html = '{{' + this.inputValue + ' | lookupNoCache:' + repeatOuterHTML + '}}&nbsp;';
                    this.repeatOuterHTML = repeatOuterHTML;
                    this.show.resulUiSelectBootstrap = true;
                }
            }
        }
        // return resulUiSelectBootstrap;
    };

    get_html_div(inputElement: any): void {
        // var resultDivObj = { html: '' };
        let htmlPrefix = '';
        let htmlSuffix = '';
        let elementIdex = -1;
        for (let j = 0; j < inputElement.children.length; j++) {
            if (inputElement.children[j].nodeName.toLowerCase() === 'input' && (inputElement.children[j].type.toLowerCase() === 'text' || inputElement.children[j].type.toLowerCase() === 'email')) {
                // resultDivObj = this.get_html_input_text(inputElement.children[j]);
                this.get_html_input_text(inputElement.children[j]);
                elementIdex = j;
            } else if (inputElement.children[j].nodeName.toLowerCase() === 'div'
            && this.JsConvertedJqueryService.hasClass(inputElement.children[j], 'ui-select-bootstrap')
            && inputElement.children[j].textContent && inputElement.children[j].textContent.length > 0) {
                // resultDivObj = this.get_ui_select_bootstrap(inputElement.children[j]);
                this.get_ui_select_bootstrap(inputElement.children[j]);
            } else if (inputElement.children[j].nodeName.toLowerCase() === 'span'
            && this.JsConvertedJqueryService.hasClass(inputElement.children[j], 'input-group-addon')
            && inputElement.children[j].textContent && inputElement.children[j].textContent.length > 0) {
                if (j === 0 || j < elementIdex) {
                    htmlPrefix = inputElement.children[j].textContent;
                    this.htmlResult.htmlPrefix = htmlPrefix;
                } else {
                    htmlSuffix = inputElement.children[j].textContent;
                    this.htmlResult.htmlSuffix = htmlSuffix;
                }
            } else {
                const tempModelValue = this.JsConvertedJqueryService.getAttrValue(inputElement.children[j], 'ng-reflect-ng-model-attr-value');
                if (tempModelValue !== null) {
                    this.htmlResult.html = tempModelValue + '&nbsp';
                    this.show.showResultHtml = true;
                }
            }
        }
        // this.htmlResult;
        // if (htmlPrefix == '$') { }

        // var resultDiv = {
        //     html: resultDivObj.html,
        //     htmlPrefix: htmlPrefix,
        //     htmlSuffix: htmlSuffix
        // };

        // return resultDiv;
    };

    get_html_ViewMode(inputElement: any): void {
        this.inputValue = (typeof this.inputAttrValue !== 'undefined') ? this.inputAttrValue : this.ngModelAttrValue;
        const htmlResult = { span: '', html: '', ngClass: '', htmlPrefix: '', htmlSuffix: '' };
        const $inputElement = inputElement;
        const element = $inputElement;
        const nodeName = (element.nodeName || '').toLowerCase();
        const type = (element.type || '').toLowerCase();

        if (typeof this.fieldViewCustom !== 'undefined' && this.fieldViewCustom.length > 0) {
            this.htmlResult.html = this.fieldViewCustom;
            this.show.showResultHtml = true;
        } else if (nodeName === 'select') {
            // htmlResult = this.get_html_select(inputElement);
            this.get_html_select(inputElement);
        } else if (nodeName === 'input' && type === 'text') {
            // htmlResult = this.get_html_input_text(inputElement);
            this.get_html_input_text(inputElement);
        } else if (nodeName === 'input' && type === 'checkbox') {
            // htmlResult = this.get_html_input_checkbox(inputElement);
            this.get_html_input_checkbox(inputElement);
        } else if (nodeName === 'tf-input-radio') {
            // htmlResult = this.get_pt_input_radio(inputElement);
            this.get_input_radio(inputElement);
        } else if (nodeName === 'tf-date-picker') {
            // htmlResult = this.get_pt_date_picker(inputElement);
            this.get_date_picker(inputElement);
        } else if (nodeName === 'div' && (
            this.JsConvertedJqueryService.hasClass(element, 'ui-select-bootstrap') ||
            this.JsConvertedJqueryService.hasClass(element, 'select2-bootstrap-append') || 
            this.JsConvertedJqueryService.hasClass(element, 'select2-container')
            )) {
            // htmlResult = this.get_ui_select_bootstrap(inputElement);
            this.get_ui_select_bootstrap(inputElement);
        } else if (nodeName === 'div') {
            // htmlResult = this.get_html_div(inputElement);
            this.get_html_div(inputElement);
        } else {
            // if (typeof $inputElement.attr('ng-model') !== 'undefined' && $inputElement.attr('ng-model') !== false) {
            //     htmlResult.html = '{{' + $inputElement.attr('ng-model') + '}}&nbsp;';
            // }
            // else if (typeof $inputElement.attr('data-ng-model') !== 'undefined' && $inputElement.attr('data-ng-model') !== false) {
            //     htmlResult.html = '{{' + $inputElement.attr('data-ng-model') + '}}&nbsp;';
            // }
            // else if (funcToPassMessages) {
            //     let message = 'directive "ptFieldView" warning: HTML element name="' + elementAttr.name +
            // '", ngModel="' + elementAttr.ngModel + '", nodeName="' + nodeName + '", type="' + type + '"  DOES NOT SUPPORTED!';
            //     funcToPassMessages(message);
            // }
            const tempModelValue = this.JsConvertedJqueryService.getAttrValue($inputElement, 'ng-reflect-ng-model-attr-value');
            if (tempModelValue !== null) {
                htmlResult.html = tempModelValue + '&nbsp;';
                // resultDivObj.html = tempModelValue + '&nbsp;';
                this.show.showResultHtml = true;
            } else if (this.TFEventfuncToPassMessages) {
                const message = 'directive "ptFieldView" warning: HTML element name="' +
                 this.name + '", ngModel="' + this.inputValue + '", nodeName="' +
                  nodeName + '", type="' + type + '"  DOES NOT SUPPORTED!';
                this.TFEventfuncToPassMessages.emit(message);
            }
        }

        if (this.allowMakingTemplates === true) {
            this.allowMakingTemplates = false;

            let foundFirstTemplate = false;
            if (!(this.show.showSpan || this.show.showEmptySpan)) {
                this.showObj.showTemplate1 = true;
                for (let i = 0; i < this.fieldViewElement.childNodes.length; i++) {
                    if (foundFirstTemplate === false && this.fieldViewElement.childNodes[i].nodeName === "DIV") {
                        foundFirstTemplate = true;
                        if (this.moveUpwardsCount === 1) {
                            this.fieldViewElement.parentNode.appendChild(this.fieldViewElement.childNodes[i]);
                        }
                        if (this.moveUpwardsCount === 2) {
                            this.fieldViewElement.parentNode.parentNode.appendChild(this.fieldViewElement.childNodes[i]);
                        }
                        this.fieldViewElement.childNodes[i].remove();
                    }
                }
            } else {
                this.showObj.showTemplate2 = true;
                for (let i = 0; i < this.fieldViewElement.childNodes.length; i++) {
                    if (this.fieldViewElement.childNodes[i].nodeName === 'DIV') {
                        if (foundFirstTemplate === true) {
                            if (this.moveUpwardsCount === 1) {
                                this.fieldViewElement.parentNode.prepend(this.fieldViewElement.childNodes[i]);
                            }
                            if (this.moveUpwardsCount === 2) {
                                this.fieldViewElement.parentNode.parentNode.prepend(this.fieldViewElement.childNodes[i]);
                            }
                            this.fieldViewElement.childNodes[i].remove();
                        }
                        foundFirstTemplate = true;
                    }
                }
            }
        }
    };

    checkViewStatus(): void {
        if (this.TFEventfuncToCheckViewStatus) {
            let modelValidation: any = null;
            if (typeof this.modelValidation !== 'undefined' && this.modelValidation.length > 0) {
                modelValidation = this.modelValidation;
            }
            const checkStatusObj = <CheckViewStatus>{
                modelPrefix: this.modelPrefix,
                fieldName: this.name, modelValidation: this.modelValidation, directiveObj: this
            };
            this.TFEventfuncToCheckViewStatus.emit(checkStatusObj);
        } else {
            this.checkViewStatusHelper(this.ApplicationConstants.viewStatuses.edit);
        }
    };

    checkViewStatusHelper(viewStatus: any) {
        this.returnOnViewStatus = viewStatus;
        let inputElement = this.fieldViewElement;
        this.moveUpwardsCount = 1;

        if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode, 'input-group')) {
            inputElement = inputElement.parentNode;
            this.moveUpwardsCount = 2;
        }

        const viewModeElement = (inputElement.parentNode.innerHTML.indexOf('fieldViewMode') >= 0) ? inputElement.parentNode.querySelector('.fieldViewMode') : null;

        if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode, 'form-group') && this.JsConvertedJqueryService.hasClass(inputElement.parentNode, 'viewModeGroup')) {
            inputElement.parentNode.classList.remove('hidden');
            inputElement.parentNode.classList.remove('viewModeGroup');
        } else if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode, 'form-group')
            && this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode, 'viewModeGroup')) {
            inputElement.parentNode.parentNode.classList.remove('hidden');
            inputElement.parentNode.parentNode.classList.remove('viewModeGroup');
        } else if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode.parentNode, 'form-group')
            && this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode.parentNode, 'viewModeGroup')) {
            inputElement.parentNode.parentNode.parentNode.classList.remove('hidden');
            inputElement.parentNode.parentNode.parentNode.classList.remove('viewModeGroup');
        }

        if (typeof this.ApplicationConstants.viewStatuses !== 'undefined' && this.ApplicationConstants.viewStatuses != null) {
            if (viewStatus === this.ApplicationConstants.viewStatuses.edit) {
                // show main element
                if (this.JsConvertedJqueryService.hasClass(inputElement, 'hidden')) {
                    inputElement.classList.remove('hidden');
                }
                // hide viewMode element
                if (typeof viewModeElement !== 'undefined' && viewModeElement != null && !this.JsConvertedJqueryService.hasClass(viewModeElement, 'hidden')) {
                    this.JsConvertedJqueryService.addClass(viewModeElement, 'hidden');
                    // http://api.jquery.com/category/manipulation/
                    // viewModeElement.detach();
                }
            } else if (viewStatus === this.ApplicationConstants.viewStatuses.hideElement) {
                // hide main element
                if (!this.JsConvertedJqueryService.hasClass(inputElement, 'hidden')) {
                    this.JsConvertedJqueryService.addClass(inputElement, 'hidden');
                }
                // hide viewMode element
                if (typeof viewModeElement !== 'undefined' && viewModeElement != null && !this.JsConvertedJqueryService.hasClass(viewModeElement, 'hidden')) {
                    this.JsConvertedJqueryService.addClass(viewModeElement, 'hidden');
                }
            } else if (viewStatus === this.ApplicationConstants.viewStatuses.hideFormGroup) {
                if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode, 'form-group')) {
                    if (!this.JsConvertedJqueryService.hasClass(inputElement.parentNode, 'hidden')) {
                        this.JsConvertedJqueryService.addClass(inputElement.parentNode, 'hidden');
                    }
                    if (!this.JsConvertedJqueryService.hasClass(inputElement, 'viewModeGroup')) {
                        this.JsConvertedJqueryService.addClass(inputElement, 'viewModeGroup');
                    }
                } else if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode, 'form-group')) {
                    if (!this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode, 'hidden')) {
                        this.JsConvertedJqueryService.addClass(inputElement.parentNode.parentNode, 'hidden');
                    }
                    if (!this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode, 'viewModeGroup')) {
                        this.JsConvertedJqueryService.addClass(inputElement.parentNode.parentNode, 'viewModeGroup');
                    }
                } else if (this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode.parentNode, 'viewModeGroup')) {
                    if (!this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode.parentNode, 'hidden')) {
                        this.JsConvertedJqueryService.addClass(inputElement.parentNode.parentNode.parentNode, 'hidden');
                    }
                    if (!this.JsConvertedJqueryService.hasClass(inputElement.parentNode.parentNode.parentNode, 'viewModeGroup')) {
                        this.JsConvertedJqueryService.addClass(inputElement.parentNode.parentNode.parentNode, 'viewModeGroup');
                    }
                }
            } else if (typeof viewModeElement !== 'undefined' && viewModeElement != null && viewStatus === this.ApplicationConstants.viewStatuses.view) {
                // hide main element
                if (!this.JsConvertedJqueryService.hasClass(inputElement, 'hidden')) {
                    this.JsConvertedJqueryService.addClass(inputElement, 'hidden');
                }
                // show viewMode element
                if (this.JsConvertedJqueryService.hasClass(viewModeElement, 'hidden')) {
                    viewModeElement.classList.remove('hidden');
                }
            } else if (viewStatus === this.ApplicationConstants.viewStatuses.view) {
                // hide main element
                if (!this.JsConvertedJqueryService.hasClass(inputElement, 'hidden')) {
                    this.JsConvertedJqueryService.addClass(inputElement, 'hidden');
                }
                // buid viewMode element
                this.get_html_ViewMode(inputElement);
            }
        }
    };

    ngOnChanges(changes: SimpleChanges) {
        const keys = Object.keys(changes);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === 'watchChangeEvent') {
                if (changes['watchChangeEvent'].previousValue !== changes['watchChangeEvent'].currentValue
                && typeof changes['watchChangeEvent'].previousValue !== 'undefined' && typeof changes['watchChangeEvent'].previousValue !== 'object') {
                    this.checkViewStatus();
                }
            }
            // else if (this.allowMakingTemplates == false) {
                // this.checkViewStatus();
            // }
        };
    }

}
