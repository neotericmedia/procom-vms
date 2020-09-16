import { Directive, HostListener, ElementRef, OnInit, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[phxFloatBetweenInput]'
})
export class FloatBetweenInputDirective implements OnInit {

    @Input('phxFloatBetweenInput') phxFloatBetweenInput: string;
    private el: HTMLInputElement;

    constructor(private elementRef: ElementRef, private control: NgControl) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
    }

    @HostListener('input', ['$event'])
    onKeyDown(event) {

        const filterValues = this.phxFloatBetweenInput !== '' ? JSON.parse(this.phxFloatBetweenInput) : JSON.parse('{"from":0, "to":100, "decimalplaces":0}');
        const initialValue = this.el.value;
        let valueStr = <string>event.target.value;
        const valueNum = parseFloat(event.target.value);

        const replaceStr = '/\.{' + filterValues.decimalplaces.toString() + ',}/';

        valueStr = filterValues.decimalplaces !== 0 ? initialValue.replace(/[^0-9.]+/g, '').replace(replaceStr, '.') : initialValue.replace(/[^0-9]+/g, '').replace(replaceStr, '.');
        // if the first character in the input field is a minus sign, add it back to valueStr
        if (initialValue.charAt(0) === '-') {
            valueStr = `-${valueStr}`;
        }

        if (initialValue !== valueStr) {
            event.stopPropagation();
        }

        if (filterValues.from >= 0 && valueStr === '-') {
            // don't allow negative sign if the from range is 0 and above
            // this condition only guards the input when user enters the first character and it happens to be - sign
            valueStr = '';
        } else if (valueStr === '.') {
            // if input only contains a dot then add 0 as prefix to keep Angular's decimal pipe happy if being used in the component
            // a dot is not a valid value for decimal pipe
            // this condition only guards the input when user enters the first character and it happens to be a dot
            valueStr = '0.';
        } else {
            const valueArray = valueStr.split('.');

            // allow dot to be entered if one already doesn't exist
            // valueArray will contain exactly two elements if a dot exists in the input
            // filterValues.decimalplaces = 0 means no dot allowed at all
            if (valueArray.length <= 2 && filterValues.decimalplaces !== 0 && event.data != null && event.data.includes('.')) {
                return;
            }

            if (filterValues.decimalplaces !== 0) {

                if (valueArray.length >= 2) {
                    valueStr = valueArray[0] + '.' + valueArray[1].slice(0, filterValues.decimalplaces);
                }

                if (valueStr.charAt(0) === '.' && valueArray[0] === '') {
                    valueStr = filterValues.from + '.' + valueArray[1];
                }

                if ((valueArray[1] || []).length > filterValues.decimalplaces) {
                    valueStr = valueArray[0] + '.' + valueArray[1].substr(0, filterValues.decimalplaces);
                }
            }

            if (valueNum < filterValues.from) {
                valueStr = filterValues.from.toString();
            } else if (valueNum > filterValues.to) {
                const valLength = valueStr.length;
                for (let i = 0; i < valLength; i++) {
                    if (parseFloat(valueStr) > filterValues.to) {
                        valueStr = valueArray[0].substr(0, valueStr.length - 1);
                    }
                }
            }

            if (valueStr.charAt(0) === '0' && valueStr.length > 1) {
                if (valueStr.charAt(1) !== '0' && valueStr.charAt(1) !== '.') {
                    valueStr = valueStr.substr(1, valueStr.length);
                } else if (valueStr.charAt(1) === '0') {
                    valueStr = valueStr.charAt(0);
                }
            }
        }
        this.el.value = valueStr;
        if (this.control) {
            this.control.control.setValue(valueStr);
        }

    }
}
