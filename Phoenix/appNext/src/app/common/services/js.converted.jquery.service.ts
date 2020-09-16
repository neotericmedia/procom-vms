import { Injectable } from '@angular/core';

@Injectable()
export class JsConvertedJqueryService {

    hasClass(element: HTMLElement, cls: String): boolean {
        if (typeof element === 'undefined' || element === null) {
            return false;
        }
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    addClass(element: HTMLElement, cls: String): void {
        if (typeof element !== 'undefined' && element !== null) {
            if ((' ' + element.className + ' ').indexOf(' ' + cls + ' ') === -1) {
                element.className += ' ' + cls;
            }
        } else {
            var x = "";
        }
    }

    getAttrValue(element: HTMLElement, nameOfAttr: String): any {
        for (let i = 0; i < element.attributes.length; i++) {
            if (element.attributes[i].name === nameOfAttr) {
                return element.attributes[i].value;
            }
        }
        return null;
    }
}
