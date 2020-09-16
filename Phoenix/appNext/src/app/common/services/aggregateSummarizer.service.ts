import { Injectable } from '@angular/core';
import * as _ from 'lodash';
@Injectable()
export class AggregateSummarizerService {
    private defaultMapping: any = {
        apply: function (key, data) {
            return {
                label: key,
                value: data
            };
        },
        action: function (data) {
            return data;
        },
        template: {

        }
    };
    constructor() { }
    aggregateGroups(mapping, startingAt, data, previous?: any) {
        if (Array.isArray(mapping) || typeof mapping === 'string') {
            return data;
        }

        if (!mapping[startingAt]) {
            return data;
        }

        const effectiveMapping = _.extend({}, this.defaultMapping, mapping[startingAt]);
        let groupedResult = effectiveMapping.action(data);
        groupedResult = _.extend({}, effectiveMapping.template, groupedResult);
        const normalizedData = [];
        let lastItem;
        const that = this;
        _.forEach(groupedResult, function (value, key) {
            lastItem = effectiveMapping.apply(key, value, previous);

            if (effectiveMapping.next) {
                lastItem[effectiveMapping.next.property] = that.aggregateGroups(mapping, effectiveMapping.next.target, value, key);
            }

            normalizedData.push(lastItem);
        });

        return normalizedData;
    }
}
