import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'objectFilter'
})
export class ObjectFilterPipe implements PipeTransform {
    transform(items: any[], filter: Object): any {
        if (!items || !filter) {
            return items;
        }
        const keys = Object.keys(filter);
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items.filter(item => {
            for (let i = 0; i < keys.length; i++) {
                if (typeof filter[keys[i]] === 'boolean') {
                    if ( item[keys[i]] !== filter[keys[i]] ) {
                        return false;
                    };
                } else if (typeof filter[keys[i]] === 'string' || typeof filter[keys[i]] === 'number') {
                    if ( item[keys[i]] !== filter[keys[i]] ) {
                        return false;
                    };
                }
            }
            return true;
        });
    }
}
