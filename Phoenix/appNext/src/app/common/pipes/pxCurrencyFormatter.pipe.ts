import { Pipe, PipeTransform } from '@angular/core';

const PADDING = '000000';

@Pipe({ name: 'pxCurrencyFormatter' })
export class PxCurrencyFormatter implements PipeTransform {

    private DECIMAL_SEPARATOR: string;
    private THOUSANDS_SEPARATOR: string;
    private NEGATIVE_SYMBOL: string;

    constructor() {
        // TODO comes from configuration settings
        this.DECIMAL_SEPARATOR = '.';
        this.THOUSANDS_SEPARATOR = ',';
        this.NEGATIVE_SYMBOL = '-';
    }

    transform(value: number | string, fractionSize: number = 2): string {
        // if not numeric - leave what the user entered as is
        value = (value + '').replace(/[\s+,]/g, '');
        if (!value || !(new RegExp('^-?\\d+(\\.\\d+)?$')).test(value)) { return value + ''; }

        let symbol = '';
        if(value.charAt(0) === this.NEGATIVE_SYMBOL) {
            symbol = this.NEGATIVE_SYMBOL;
            value = value.slice(1);
        }

        let [integer, fraction = ''] = (value || '').toString()
            .split(this.DECIMAL_SEPARATOR);

        fraction = fractionSize > 0
            ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
            : '';

        integer = Number(integer).toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.THOUSANDS_SEPARATOR);
        return symbol + '$' + integer + fraction;
    }

    parse(value: string, fractionSize: number = 2): string {
        let [integer, fraction = ''] = (value || '').split(this.DECIMAL_SEPARATOR);

        integer = integer.replace(new RegExp(this.THOUSANDS_SEPARATOR, 'g'), '');

        fraction = parseInt(fraction, 10) > 0 && fractionSize > 0
            ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
            : '';
        return '$' + integer + fraction;
    }
}
