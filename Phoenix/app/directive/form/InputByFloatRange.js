(function (directives) {
    'use strict';
    /**

    @name directives.inputByFloatRange
    @description
   Used to filter keyboard entries for <input type="text"/> component to allow to type only digits in described range from='from' to='to', 
    the number of decimals is determined from the 'from' and'to' inputs, taking largest number of decimals to be the max number of decimals.
    directive values:
        *from - min allowed float value;
        *to - max allowed float value;
        *decimalplaces - decimal places
        *doesemptytozero - true gives "0", false gives ""
    example:   

    <input type="text" input-by-float-range="{from:0.01, to:24, decimalplaces:2, doesemptytozero:'false'}" />
    
    OR 
    
    var optionsInController = {from:0.01, to:24, decimalplaces:2, doesemptytozero:'false'};
    <input type="text" input-by-float-range="optionsInController" />

    **/
    directives.directive('inputByFloatRange', ['$parse', '$filter', function ($parse, $filter) {
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };

        return directive;

        function link(scope, element, attr, ngModel) {

            var options = {
                from: -99.9,
                to: 99.99,
                decimalplaces: 2,
                doesemptytozero: 'true' //=0, flase=""
            };



            var expression = attr.inputByFloatRange ? $parse(attr.inputByFloatRange)(scope) : {};
            options = angular.extend(options, expression);

            var onNoneChange = attr.onNoneChange ? $parse(attr.inputByFloatRange)(scope) : function () { };

            //disable paste function if needed
            //element.bind("paste",function(e) {
            //    e.preventDefault();
            //})

            //prevent user from entering multiple values at the same time by holding down key
            //var keyCount = 0;
            //$(function () {
            //    element.keypress(function (e) {
            //        if (keyCount > 1) {
            //            e.preventDefault();
            //        }
            //        keyCount++;
            //    });
            //    element.keyup(function () {
            //        keyCount = 0;
            //    });
            //});

            var defaultEmptyString = (options.doesemptytozero.toString().toLowerCase() == 'true') ? '0' : '';

            var valueParser = function (value) {

                //Final Parsed Value
                var parseValue = "0";

                if (!value) {

                    return value;
                }
                if (typeof value === 'number') {
                    value = value.toString();
                }
                if (value.length === 0 || (value.charAt(0) == '0' && value.length == 1)) {
                    value = defaultEmptyString;
                    parseValue = value;
                }
                else {

                    //check if(from<to)
                    var toFloat, fromFloat, decimalplacesInt;
                    if (typeof options.from === 'number') {
                        fromFloat = options.from;
                    }
                    else {
                        fromFloat = parseFloat(options.from);
                    }
                    if (typeof options.to === 'number') {
                        toFloat = options.to;
                    }
                    else {
                        toFloat = parseFloat(options.to);
                    }
                    decimalplacesInt = parseInt(options.decimalplaces, 10);

                    if (fromFloat > toFloat) {
                        //Abort or signal something to user
                        alert("Inncorrect range set, using input-by-float-range directive, to < from.");
                        return value;
                    }


                    //decimal places based off the from and to values
                    //var decimalplaces = 0;
                    //var fromDotSplit = options.from.toString().split('.');
                    //var toDotSplit = options.to.toString().split('.');
                    //decimalplaces = fromDotSplit[1].length >= toDotSplit[1].length ? fromDotSplit[1].length : toDotSplit[1].length;


                    //cleanse any numbers infront of negative sign, if does exist
                    var clean = value;
                    if (clean.length > 1) {
                        var isNegative = clean.indexOf("-") != "-1";//

                        if (isNegative) {
                            var cleanNegativeSplit = clean.split("-");
                            var numberOfNegatives;
                            var storeIndex = {};
                            storeIndex[0] = clean.indexOf("-");
                            var afterFirstNegative = "";
                            afterFirstNegative = clean.slice(storeIndex[0] + 1, clean.length);
                            if (afterFirstNegative.indexOf("-") == "-1") {
                                numberOfNegatives = 1;
                            }
                            else {
                                numberOfNegatives = 2;
                            }

                            //two or more Negatives
                            if (numberOfNegatives >= 2) {
                                clean = "-" + cleanNegativeSplit[cleanNegativeSplit.length - 1];
                            }
                                //only one negative
                            else if (numberOfNegatives == 1) {
                                if (clean.indexOf("-") == clean.length - 1) {
                                    clean = "-";
                                }
                                else if (clean.indexOf("-") === 0) {
                                    // todo;
                                }
                                else {
                                    clean = "-" + cleanNegativeSplit[cleanNegativeSplit.length - 1];
                                }

                            }

                        }
                    }

                    //Validation using RegEX
                    clean = decimalplacesInt === 0 ?
                        clean.replace(/\.{2,}/g, '.').replace(/[^0-9\n\r\-]/gmi, '') :
                        clean.replace(/\.{2,}/g, '.').replace(/[^0-9\.\n\r\-]/gmi, '');
                    //for accepting e -->   .replace(/e{2,}/gmi, 'e')

                    if (clean.length === 0) {
                        if (clean !== value) {
                            ngModel.$setViewValue(clean);
                            ngModel.$render();
                        }
                        return clean;
                    }


                    //RegEx limits to only 1 dot
                    var isDot = false;
                    if (clean.indexOf(".") != "-1") {
                        isDot = true;
                    }
                    var cleanSplit = clean.split('.');


                    //Numbers before decimal = cleanSplit[0]
                    //Remove extra zero's stacked for no reason, Ex: -00.56 --> -0.56
                    var firstNumbers = cleanSplit[0].split("");
                    for (var i = 0; i < firstNumbers.length - 1; i++) {
                        if (i === 0 && firstNumbers[0] == "-") {
                            //TODO
                        }
                        else if (firstNumbers[i] != "0") {
                            break;
                        }
                        else if (firstNumbers[i] == "0") {
                            firstNumbers.splice(i, 1);
                        }
                    }
                    cleanSplit[0] = firstNumbers.join("");

                    //Cut down numbers after 'decimalplaces' limit
                    //Jion firstNumbers with decimal point and numbers after it
                    if (cleanSplit.length == 2) {
                        cleanSplit[1] = cleanSplit[1].slice(0, decimalplacesInt);
                        clean = cleanSplit[0] + "." + cleanSplit[1];
                    }
                    else {
                        if (isDot) {
                            clean = cleanSplit[0] + ".";
                        }
                        else {
                            clean = cleanSplit[0];
                        }
                    }



                    //-.12345 --> -0.12345
                    if (clean.charAt(0) == "-" && clean.charAt(1) == ".") {
                        var cleanSplitByDigit = clean.split("");
                        cleanSplitByDigit.splice(1, 0, "0");
                        clean = cleanSplitByDigit.join("");
                    }

                    if (clean.charAt(0) == '-' && clean.length == 1) {
                        // todo
                    }
                    else if (clean.charAt(0) == '.' && clean.length == 1) {
                        clean = '0.';
                    }
                    else {
                        try {
                            var cleanFloat = parseFloat(clean);
                            if ((cleanFloat >= fromFloat) && cleanFloat <= toFloat) {
                                //In range
                            }
                            else {
                                while (clean.length > 1 && (cleanFloat < options.from || cleanFloat > options.to)) {
                                    clean = clean.slice(0, clean.length - 1);
                                    cleanFloat = parseFloat(clean);
                                }
                                if (typeof clean === 'number') {
                                    clean = clean.toString();

                                }

                            }

                            ///Instead of deleting, when max or min range is overstepped, returned value becomes max or min
                            //else if (!(cleanFloat >= fromFloat)) {
                            //    // clean = fromFloat.toString();
                            //    ;
                            //}
                            //else if (!(cleanFloat <= toFloat)) {
                            //    ;
                            //   // clean = toFloat.toString();
                            //}

                        } catch (e) { clean = defaultEmptyString; }
                    }
                    parseValue = clean;

                }
                if (parseValue !== value) {
                    ngModel.$setViewValue(parseValue);
                    ngModel.$render();
                }
                return parseValue;
            };

            ngModel.$formatters.push(function (value) {
                if (parseFloat(ngModel.$viewValue) === value) {
                    onNoneChange();
                    return ngModel.$viewValue;
                }

                if (ngModel.$viewValue == value + '.') {
                    onNoneChange();
                    return ngModel.$viewValue;
                }
                return value;
            });

            ngModel.$parsers.push(function (value) {
                var parsedValue = valueParser(value);
                if ((parsedValue == "-") || (parsedValue == '-0') || (parsedValue == '-0.')) {
                    return 0;
                }
                return parsedValue;
            });

        }

    }]);

})(Phoenix.Directives);