import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phxSelectFilter'
})
export class PhxSelectFilterPipe implements PipeTransform {
    getFinalString(TextSelector: String, item: any) {
        let text = '';
        let tempTextString = '';
        let tempTextStringActive = false;

        for (let y = 0; y < TextSelector.length; y++) {
            const checkJustActive = tempTextStringActive;
            if (TextSelector[y] === '*') {
                tempTextStringActive === true ? tempTextStringActive = false : tempTextStringActive = true;
                if (tempTextStringActive === false) {
                    text += item[tempTextString];
                    tempTextString = '';
                }
            }
            if (checkJustActive && tempTextStringActive) {
                tempTextString += TextSelector[y];
            }
            if (checkJustActive === false && tempTextStringActive === false) {
                text += TextSelector[y];
            }
        }
        return text;
    }

    transform(items: any[], filter: Object): any {
        if (!items || !filter) {
            return [];
        }
        const ScreenText = filter['Text'];
        const ValueField = filter['ValueField'];
        // sortOrder is an optional parameter.
        const sortOrder = filter['Order'];
        const decreasingOrder = filter['DecreasingOrder'];
        // filter out * symbols and convert them.

        const returnItems = [];
        for (let y = 0; y < items.length; y++) {
            const textString = this.getFinalString(ScreenText, items[y]); // items[y][ScreenText]
            // const idString = this.getFinalString(ValueField, items[y]); // items[y][ScreenId]
            const idString = items[y][ValueField];
            if (typeof sortOrder === 'undefined' || sortOrder === null) {
                returnItems.push({'id' : idString, 'text' : textString});
            } else {
                returnItems.push({'id' : idString, 'text' : textString, 'order' : items[y][sortOrder]});
            }
        }
        if (typeof sortOrder === 'undefined' || sortOrder === null) {
            return returnItems;
        } else {
            returnItems.sort(function(a, b) {
                if (decreasingOrder) {
                    return b.order - a.order;
                } else {
                    return a.order - b.order;
                }
            });
            return returnItems;
        }
    }
}
