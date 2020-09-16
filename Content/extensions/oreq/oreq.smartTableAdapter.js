(function (oRequest) {
    // oreq.js extension
    if (oRequest) {
        oRequest.filterMixin({
            smartTableObjectConverter: function (obj) {
                var f = oreq;

                var baseFilter = "";

                if (obj && typeof obj == "object") {
                    var keys = Object.keys(obj);

                    var arrayOfEvaluatedFilters = [];

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        if (obj.hasOwnProperty(prop)) {
                            var val = obj[prop];
                            if (angular.isArray(val)) {

                                if (/^ODATAEXP_/.test(prop)) {
                                    var oDataExpressionValue = "";
                                    var useSecondarySearch = false;
                                    if (val.length > 0) {
                                        useSecondarySearch = val[val.length - 1];
                                        //var useSecondarySearch = val.pop();
                                    }
                                    for (var l = 0; l < val.length - 1; l++) {
                                        oDataExpressionValue += val[l];
                                        if (l < val.length - 2) {
                                            if (useSecondarySearch == true) {
                                                oDataExpressionValue += " or ";
                                            }
                                            else {
                                                oDataExpressionValue += " and ";
                                            }
                                        }
                                    }
                                    if (oDataExpressionValue) {
                                        arrayOfEvaluatedFilters.push("(" + oDataExpressionValue + ")");
                                    }
                                } else {
                                    var lambdas = [];
                                    for (var j = 0; j < val.length; j++) {
                                        var subVal = val[j];
                                        lambdas.push(subVal);
                                    }
                                    arrayOfEvaluatedFilters.push(f.filter(prop).eqOr(lambdas).evalInfix());
                                }
                            }
                            else {
                                var currFilter = null;

                                if (/^ODATAEXP_/.test(prop) && val) {
                                    arrayOfEvaluatedFilters.push("(" + val + ")");
                                } else {
                                    var searchFieldType = "000";

                                    if (typeof val == 'boolean') {
                                        searchFieldType = "000";
                                    }
                                    else if (typeof val != 'number') {
                                        tempVal = val.split("");
                                        // Take off the last three characters, they are selection search options, see stAdvancedSearch Search function near the bottom
                                        if (tempVal.length > 0) {
                                            searchFieldType = tempVal[tempVal.length - 1] + tempVal[tempVal.length - 2] + tempVal[tempVal.length - 3];
                                            val = val.substring(0, val.length - 3);
                                            //tempVal = val.split("");
                                            //if (tempVal[0] == "'" && "'" == tempVal[tempVal.length - 1]) {
                                            //    val = val.substring(1, val.length - 1);
                                            //}
                                        }
                                    }
                                    else {
                                        val = val.toString();
                                        searchFieldType = "000";
                                    }
                                    if (/^\'.*?\'$/g.test(val)) {
                                        // Search for string type fields
                                        if (searchFieldType == "000") {
                                            currFilter = f.filter("tolower(" + val + ")").substringOf("tolower(" + prop + ")");
                                        } else if (searchFieldType == "001") {
                                            currFilter = f.filter("tolower(" + prop + ")").startsWith("tolower(" + val + ")");
                                        } else if (searchFieldType == "002") {
                                            currFilter = f.filter("tolower(" + prop + ")").endsWith("tolower(" + val + ")");
                                        }
                                    } else {
                                        // Search for numbers
                                        if (searchFieldType == "000") {
                                            currFilter = f.filter(prop).eq(val);
                                        } else if (searchFieldType == "001") {
                                            currFilter = f.filter(prop).ne(val);
                                        } else if (searchFieldType == "002") {
                                            currFilter = f.filter(prop).gt(val);
                                        } else if (searchFieldType == "003") {
                                            currFilter = f.filter(prop).ge(val);
                                        } else if (searchFieldType == "004") {
                                            currFilter = f.filter(prop).lt(val);
                                        } else if (searchFieldType == "005") {
                                            currFilter = f.filter(prop).le(val);
                                        }
                                        //currFilter = f.filter(prop).eq(val);
                                    }
                                    arrayOfEvaluatedFilters.push(currFilter.evalInfix());
                                }
                            }
                        }
                    }

                    if (arrayOfEvaluatedFilters.length) {
                        for (var k = 0; k < arrayOfEvaluatedFilters.length; k++) {
                            var el = arrayOfEvaluatedFilters[k];
                            if (el) {
                                baseFilter += "(" + el + ")";
                                if (k < arrayOfEvaluatedFilters.length - 1) {
                                    baseFilter += " and ";
                                }
                            }
                        }
                    }
                }
                //console.log('baseFilter: ' + baseFilter);
                return baseFilter;
            }
        });
    }
})(oreq);
