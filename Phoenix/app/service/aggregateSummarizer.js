/**
 * @ngdoc service
 * @name aggregateSummarizer
 * @description
 * The aggregateSummarizer service is useful for aggregating different views of grouped data from a common set or
 * list of data.
 *
 * For example, if you have a set of data like so:
 * [{prop1id: 12, prop2: 'a value', prop3id: 15, prop4: 'another value'},
 * {prop1id: 11, prop2: 'some value', prop3id: 25, prop4: 'yet another value'},
 * {prop1id: 11, prop2: 'yet again', prop3id: 26, prop4: 'yet another value again'}
 *
 * and you need to group the data based on certain properties, you can use the aggregateSummarizer to chain
 * filters against the data and then transform the result into something that better suits the needs in the view.
 *
 * Taking the above data, suppose you want to show summary counts on the view. In general, using a filter to group,
 * like the angular-filter groupBy filter, will exclude any groups without data, although you still may need to
 * display those items in the view:
 *
 * count of prop1id types: 1
 * count of prop2id types: 2
 * count of prop3id types: 0
 * count of prop4id types: 0
 *
 * Notice that there are other propid* types, however since they are not in the original data set, they would obviously
 * not appear in an aggregate count after grouping as the groups themselves would be absent.
 *
 * Using the aggregateSummarizer, you can define a template of all of the groups you want to be present, even if
 * they are not in the data, and you can define a list of filters that will be executed against the original data and,
 * after all of the filters in the chain have been fired, you can use a method to decorate or modify the data to
 * return it to suit your needs. The methods are called recursively, if the mapping is defined in a certain way.
 * @see PaymentPendingGroupController for a usage example.
 *
 * The format of the mapping object is as follows:
 * var mapping = {
 *  group1: {
 *      apply: function (key, value) {
 *          // called for every data item in the resulting list. This is where you can return an object that suits your needs.
 *      },
 *      action: function (data) {
 *          // called to group the data for this step
 *      },
 *      next: {
 *          property: 'the property to append the next/child aggregate group to for this current set',
 *          target: 'the next target in the chain'
 *      }
 *   },
 *   group2:...
 * };
 *
 * A concrete mapping example:
 * var concreteMapping = {
 *      companies: {
                apply: function (key, data) {
                    return {
                        companyName: key,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'OrganizationInternalLegalName');
                },
                next: {
                    property: 'currencies',
                    target: 'currencies'
                }
            },
            currencies: {
                apply: function (key, data) {
                    return {
                        currencyCode: key,
                        count: data.length,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'CurrencyId');
                },
                next: {
                    property: 'paymentMethods',
                    target: 'paymentMethods'
                }
            }
            ...
 * };
 *
 */
(function (services) {
    'use strict';
    services
        .constant('defaultMapping', {
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
        })
        .factory('aggregateSummarizer', ['defaultMapping', AggregateSummarizer]);

    /** @ngInject **/
    function AggregateSummarizer(defaultMapping) {
        var self = this;

        return angular.extend(self, {
            aggregateGroups: aggregateGroups
        });

        function aggregateGroups(mapping, startingAt, data, previous) {
            if (Array.isArray(mapping) || typeof mapping === 'string') {
                return data;
            }

            if (!mapping[startingAt]) {
                return data;
            }

            var effectiveMapping = angular.extend({}, defaultMapping, mapping[startingAt]);
            var groupedResult = effectiveMapping.action(data);
            groupedResult = angular.extend({}, effectiveMapping.template, groupedResult);
            var normalizedData = [];
            var lastItem;

            angular.forEach(groupedResult, function (value, key) {
                lastItem = effectiveMapping.apply(key, value, previous);

                if (effectiveMapping.next) {
                    lastItem[effectiveMapping.next.property] = aggregateGroups(mapping, effectiveMapping.next.target, value, key);
                }

                normalizedData.push(lastItem);
            });

            return normalizedData;
        }
    }

})(Phoenix.Services);