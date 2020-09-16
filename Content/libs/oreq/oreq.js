(function (exports) {

    Array.prototype.peek = function () {
        return this[this.length - 1];
    };
    var extendObj = function (childObj, parentObj) {
        var tmpObj = function () { };
        tmpObj.prototype = parentObj.prototype;
        childObj.prototype = new tmpObj();
        childObj.prototype.constructor = childObj;
    };
    var extendProto = function (destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination.prototype[k] = source[k];
            }
        }
        return destination;
    };
    exports.request = function (root) {
        return new Request(root);
    };
    exports.filter = function (value, type) {
        return new PrimitiveExpression([], value, type);
    };
    var _precedenceMap = {
        '(': 1
    };
    function _isArray(obj) {
        return obj instanceof Array;
    }
    function _isNumber(obj) {
        return Object.prototype.toString.call(obj) == '[object Number]';
    }
    function _isString(obj) {
        return Object.prototype.toString.call(obj) == '[object String]';
    }
    function _isUndefined(obj) {
        return typeof obj === 'undefined';
    }
    function _isExpression(obj, type) {
        if (_isUndefined(type))
            return obj instanceof Expression;
        else
            return obj instanceof type;
    }
    function _isOperator(obj) {
        return obj instanceof Operator;
    }
    function _isOperand(obj) {
        return obj instanceof Operand;
    }
    function _precedenceOf(c) {
        if (_isOperand(c))
            return 99;
        if (_isString(c))
            return _precedenceMap[c] || 50;
        return _precedenceMap[c.value] || 50;
    }
    function _infixToPostfix(infix) {

        var output = [];
        var stack = [];

        for (var k = 0; k < infix.length; k++) {

            var c = infix[k];

            if (c == '(') {
                stack.push(c);
            }
            else if (c == ')') {
                while (stack.peek() != '(' && !_isUndefined(stack.peek())) {
                    output.push(stack.pop());
                }
                stack.pop(); // pop '('
            }

            else {
                while (stack.length) {
                    var peekedChar = stack.peek();

                    var peekedCharPrecedence = _precedenceOf(peekedChar);
                    var currentCharPrecedence = _precedenceOf(c);

                    if (peekedCharPrecedence >= currentCharPrecedence) {
                        output.push(stack.pop());
                    } else {
                        break;
                    }
                }
                stack.push(c);
            }

        }

        while (stack.length)
            output.push(stack.pop());

        return output;

    }
    function _evalPostfix(postfix) {
        if (!postfix || !postfix.length)
            return;

        var result = postfix.join(' ');

        var stack = [];

        while (postfix.length) {
            var cur = postfix.shift();
            if (cur instanceof UnaryOperator) {
                var una = stack.pop();
                var unval = _evalUnaryOpr(cur, una);
                stack.push(new Operand(unval));
            }
            else if (cur instanceof Operator) {
                var bina = stack.pop();
                var b = stack.pop();
                var binval = _evalBinaryOpr(cur, b, bina);
                stack.push(new Operand(binval));
            }
            else {
                stack.push(cur);
            }
        }

        return stack.pop().value;
    }
    function _evalBinaryOpr(op, a, b) {
        if (op.value == 'any' || op.value == 'all') {
            return a.value + '/' + op.value + '(x: ' + b.value + ')';
        }
        else if (op.value == 'substringof' || op.value == 'endswith' || op.value == 'startswith') {
            return op.value + '(' + a.value + ',' + b.value + ')';
        }
        else {
            return [a.value, op.value, b.value].join(' ');
        }
    }
    function _evalUnaryOpr(op, a) {
        if (op.value == 'year') {
            return op.value + '(' + a.value + ')';
        }
    }
    function _toUrl(req, decoded) {
        var result = req.root;
        var params = [];

        var fn = !decoded ? escape : function (val) { return val; };

        if (!_isUndefined(req.expand))
            params.push('$expand=' + fn(req.expand));
        if (!_isUndefined(req.format))
            params.push('$format=' + fn(req.format));
        if (!_isUndefined(req.filter))
            params.push('$filter=' + fn(req.filter));
        if (!_isUndefined(req.orderby))
            params.push('$orderby=' + fn(req.orderby));
        if (!_isUndefined(req.top))
            params.push('$top=' + fn(req.top));
        if (!_isUndefined(req.skip))
            params.push('$skip=' + fn(req.skip));
        if (!_isUndefined(req.select))
            params.push('$select=' + fn(req.select));
        if (!_isUndefined(req.inlinecount))
            params.push('$inlinecount=' + fn(req.inlinecount));


        var p = params.join('&');

        result = result || '';

        if (result && p) {
            result += '?';
        }
        if (p) {
            result += p;
        }
        return result;
    }

    function _toParams(req, decoded) {
        var params = { root: req.root };

        var fn = !decoded ? escape : function (val) { return val; };

        if (!_isUndefined(req.expand))
            params.$expand = fn(req.expand);
        if (!_isUndefined(req.format))
            params.$format = fn(req.format);
        if (!_isUndefined(req.filter))
            params.$filter = fn(req.filter);
        if (!_isUndefined(req.orderby))
            params.$orderby = fn(req.orderby);
        if (!_isUndefined(req.top))
            params.$top = fn(req.top);
        if (!_isUndefined(req.skip))
            params.$skip = fn(req.skip);
        if (!_isUndefined(req.select))
            params.$select = fn(req.select);
        if (!_isUndefined(req.inlinecount))
            params.$inlinecount = fn(req.inlinecount);

        return params;
    }

    /**
	 *
	 * REQUEST
	 *
	 */
    var Request = function (root) {
        this.req = { root: root };
        return this;
    };
    Request.prototype = {
        withExpand: function (val) {
            if (_isArray(val) && val.length > 0) {
                this.req.expand = val.join(',');
            }
            else if (!_isArray(val)) {
                this.req.expand = val;
            }
            return this;
        },
        withOrderby: function (val) {
            if (_isArray(val) && val.length > 0) {
                this.req.orderby = val.join(',');
            }
            else if (!_isArray(val)) {
                this.req.orderby = val;
            }
            return this;
        },
        withFormat: function (val) {
            this.req.format = val;
            return this;
        },
        withSkip: function (val) {
            this.req.skip = val;
            return this;
        },
        withTop: function (val) {
            this.req.top = val;
            return this;
        },
        withFilter: function (val) {
            if (_isExpression(val, BoolCommonExpression)) {
                this.req.filter = val.evalInfix();
            }
            else if (val === null || _isUndefined(val) || _isString(val) || _isNumber(val)) {
                this.req.filter = val;
            }
            else {
                throw new Error('Invalid filter expression');
            }
            return this;
        },
        withInlineCount: function () {
            this.req.inlinecount = 'allpages';
            return this;
        },
        withSelect: function (val) {
            if (_isArray(val) && val.length > 0) {
                this.req.select = val.join(',');
            }
            else if (!_isArray(val)) {
                this.req.select = val;
            }
            return this;
        },
        url: function (decoded) {
            return _toUrl(this.req, decoded);
        },
        param: function (decoded) {
            return _toParams(this.req, decoded);
        }
    };

    var Operand = function (value) {
        this.value = value;
    };
    Operand.prototype.toString = function () {
        return "opd:" + this.value;
    };
    var Operator = function (value) {
        this.value = value;
    };
    Operator.prototype.toString = function () {
        return "opr:" + this.value;
    };
    var UnaryOperator = function (value) {
        Operator.call(this, value);
    };
    UnaryOperator.prototype.toString = function () {
        return "uopr:" + this.value;
    };
    extendObj(UnaryOperator, Operator);
    /**
	 *
	 * EXPRESSION
	 *
	 */
    var Expression = function (infix) {
        this.infix = infix;
        this.field = this;
    };
    Expression.prototype.addOperand = function (value) {
        this.infix.push(new Operand(value));
    };
    Expression.prototype.addOperator = function (value) {
        this.infix.push(new Operator(value));
    };
    Expression.prototype.addUnaryOperator = function (value) {
        this.infix.push(new UnaryOperator(value));
    };
    Expression.prototype.addInternal = function (value) {
        this.infix.push(value);
    };
    Expression.prototype.addLambda = function (lambda) {
        this.infix.push('(');
        if (_isArray(lambda)) {
            for (var i = 0; i < lambda.length; i++) {
                if (_isOperand(lambda[i])) {
                    if (_isUndefined(lambda[i].value)) {
                        lambda[i].value = 'x';
                    }
                    else if (_isString(lambda[i].value) && lambda[i].value.indexOf('/') === 0) {
                        lambda[i].value = 'x' + lambda[i].value;
                    }
                }
            }
        }
        this.infix = this.infix.concat(lambda);
        this.infix.push(')');
    };
    Expression.prototype.evalInfix = function () {
        // eval this.infix;
        var paren = 0;
        for (var i = 0; i < this.infix.length; i++) {
            if (this.infix[i] == '(' || this.infix[i] == ')')
                paren++;
        }
        if (paren % 2 !== 0) this.addInternal(')');

        //var instring = this.infix.join(' ');
        var post = _infixToPostfix(this.infix);
        var poststring = _evalPostfix(post);
        return poststring;
    };

    var CommonExpression = function (infix) {
        Expression.call(this, infix);
    };
    extendObj(CommonExpression, Expression);

    CommonExpression.prototype.eq = function (value) {
        this.addOperator('eq');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.ne = function (value) {
        this.addOperator('ne');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.gt = function (value) {
        this.addOperator('gt');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.ge = function (value) {
        this.addOperator('ge');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.lt = function (value) {
        this.addOperator('lt');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.le = function (value) {
        this.addOperator('le');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.not = function (value) {
        this.addOperator('not');
        this.addOperand(value);
        return new BoolCommonExpression(this.infix);
    };

    CommonExpression.prototype.add = function (value) {
        this.addOperator('add');
        this.addOperand(value);
        return new CommonExpression(this.infix);
    };

    CommonExpression.prototype.sub = function (value) {
        this.addOperator('sub');
        this.addOperand(value);
        return new CommonExpression(this.infix);
    };

    CommonExpression.prototype.mul = function (value) {
        this.addOperator('mul');
        this.addOperand(value);
        return new CommonExpression(this.infix);
    };

    CommonExpression.prototype.div = function (value) {
        this.addOperator('div');
        this.addOperand(value);
        return new CommonExpression(this.infix);
    };

    CommonExpression.prototype.mod = function (value) {
        this.addOperator('mod');
        this.addOperand(value);
        return new CommonExpression(this.infix);
    };

    var BoolCommonExpression = function (infix) {
        Expression.call(this, infix);
    };
    extendObj(BoolCommonExpression, CommonExpression);

    BoolCommonExpression.prototype.filter = function (value, type) {
        return new PrimitiveExpression(this.infix, value, type);
    };

    BoolCommonExpression.prototype.and = function (value) {
        this.addInternal(')');
        this.addOperator('and');
        return new BoolCommonExpression(this.infix);
    };

    BoolCommonExpression.prototype.or = function (value) {
        this.addInternal(')');
        this.addOperator('or');
        return new BoolCommonExpression(this.infix);
    };


    function PrimitiveExpression(infix, value, type) {
        this.value = value;
        Expression.call(this, infix);
        this.addInternal('(');
        this.addOperand(value);
    }
    extendObj(PrimitiveExpression, CommonExpression);

    PrimitiveExpression.prototype.any = function (lambda) {
        // check if path expression?
        this.addOperator('any');
        this.addLambda(lambda.infix);
        this.addInternal(')');
        return new BoolCommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.all = function (lambda) {
        // check if path expression?
        this.addOperator('all');
        this.addLambda(lambda);
        this.addInternal(')');
        return new BoolCommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.year = function () {
        this.addUnaryOperator('year');
        return new CommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.month = function () {
        this.addUnaryOperator('month');
        return new CommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.day = function () {
        this.addUnaryOperator('day');
        return new CommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.hour = function () {
        this.addUnaryOperator('hour');
        return new CommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.minute = function () {
        this.addUnaryOperator('minute');
        return new CommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.second = function () {
        this.addUnaryOperator('second');
        return new CommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.substringOf = function (value) {
        this.addOperator('substringof');
        this.addOperand(value);
        this.addInternal(')');
        return new BoolCommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.endsWith = function (value) {
        this.addOperator('endswith');
        this.addOperand(value);
        this.addInternal(')');
        return new BoolCommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.startsWith = function (value) {
        this.addOperator('startswith');
        this.addOperand(value);
        this.addInternal(')');
        return new BoolCommonExpression(this.infix);
    };

    PrimitiveExpression.prototype.indexOf = function (value) {
        this.addOperator('indexof');
        this.addOperand(value);
        this.addInternal(')');
        return new CommonExpression(this.infix);
    };

    exports.filterMixin = function (mixin) {
        extendProto(PrimitiveExpression, mixin);
    };

    exports.filterMixin({
        eqOr: function (arr) {
            var f = oreq;

            if (_isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    f = f.filter(this.value).eq(arr[i]);
                    if (arr.length != (i + 1)) f.or();
                }
            }
            else if (arr) {
                f = f.filter(this.value).eq(arr);
            }

            return f;
        },
        yearEqOr: function (arr) {
            var f = oreq;

            if (_isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    f = f.filter(this.value).year().eq(arr[i]);
                    if (arr.length != (i + 1)) f.or();
                }
            }
            else if (arr) {
                f = f.filter(this.value).year().eq(arr);
            }

            return f;
        },
        anyOr: function (arr, lambda) {
            var f = oreq;

            if (_isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    f = f.filter(lambda).eq(arr[i]);
                    if (arr.length != (i + 1)) f.or();
                }
            }
            else if (arr) {
                f = f.filter(lambda).eq(arr);
            }

            return this.any(f);
        },
        anyYearOr: function (arr, lambda) {
            var f = oreq;

            if (_isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    f = f.filter(lambda).year().eq(arr[i]);
                    if (arr.length != (i + 1)) f.or();
                }
            }
            else if (arr) {
                f = f.filter(lambda).year().eq(arr);
            }

            return this.any(f);
        }
    });


})(typeof exports === 'undefined' ? this.oreq = {} : exports);