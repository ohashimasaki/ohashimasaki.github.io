//----------------------------------------------------------------------------------------------------
function Tequila() {

    this.from = function(d) {
        var a = [];
        for(var i = 0; i < d.length; i++) {
            a[i] = d[i];
        }
        return new tequila(a);
    };


    function tequila(a) {

        var g = {};
        var grouped = false;
        var seq = [];

        this.select = function() {
            if(grouped) {
                return unique(map(g, arguments, seq));
            } else {
                return map(a, arguments, seq);
            }
        };

        this.distinct = function() {
            if(grouped) {
                return unique(map(g, arguments, seq));
            } else {
                return unique(map(a, arguments, seq));
            }
        };

        this.where = function(evaluator) {
            if(grouped) {
                throw "";
            }
            seq.unshift({
                name: "where",
                evaluator: evaluator
            });
            return this;
        };

        this.groupby = function(f) {
            if(grouped) {
                throw "";
            }
            filter(a, seq);
            if(arguments.length != 1) {
                throw "";
            }
            for(var i = 0; i < a.length; i++) {
                var e = a[i];
                var k = (typeof f == "function") ? f(e) : e[f];
                if( ! g[k]) {
                    g[k] = [];
                }
                g[k].push(e);
            }
            grouped = true;
            return this;
        };


        this.join = function(b, f1, f2, outer) {
            if(grouped) {
                throw "";
            }
            if(arguments.length < 3) {
                throw "";
            }
            if( ! isArray(b)) {
                throw "";
            }
            if(typeof f1 != "string" || typeof f2 != "string") {
                throw "";
            }

            var u = [];
            for(var i = 0; i < a.length; i++) {
                var v = a[i][f1];
                var e = {};
                var found = false;
                for(var j = 0; j < b.length; j++) {
                    if(b[j][f2] == v) {
                        for(var f in a[i]) {
                            e[f] = a[i][f];
                        }
                        for(var f in b[j]) {
                            if( ! a[i].hasOwnProperty(f)) {
                                e[f] = b[j][f];
                            }
                        }
                        u.push(e);
                        found = true;
                    }
                }
                if( ! found && outer) {
                    for(var f in a[i]) {
                        e[f] = a[i][f];
                    }
                    for(var f in b[0]) {
                        if( ! a[i].hasOwnProperty(f)) {
                            e[f] = null;
                        }
                    }
                    u.push(e);
                } 
            }
            a = u;
            return this;
        };


        this.orderby = function() {
            if(grouped) {
                throw "";
            }
            var args = arguments;
            if(args.length < 1 || 2 < args.length) {
                throw "";
            }
            filter(a, seq);
            var f = args[0];
            if(typeof f == "string") {
                a.sort(function(e1, e2) {
                    if(args.length == 2 && typeof args[1] == "string" && /^desc(?:ending)?$/i.test(args[1])) {
                        return (e1[f] < e2[f]) ? 1 : -1;
                    } else {
                        return (e1[f] > e2[f]) ? 1 : -1;
                    }
                    return 0;
                })
            } else if(typeof f == "function") {
                a.sort(f);
            }
            return this;
        };


        this.delete = function() {
            if(grouped) {
                throw "";
            }
            return remove(a, seq);
        };

        this.sum = function(f) {
            if( ! f || typeof f != "string") {
                throw "";
            }
            if(grouped) {
                var e = {};
                for(var k in g) {
                    var s = 0;
                    for(var i = 0; i < g[k].length; i++) {
                        var v = g[k][i][f];
                        if(isNumber(v)) {
                            s += Number(v);
                        }
                    }
                    e[k] = s;
                }
                return e;
            } else {
                filter(a, seq);
                var s = 0;
                for(var i = 0; i < a.length; i++) {
                    var v = a[i][f];
                    if(isNumber(v)) {
                        s += Number(v);
                    }
                }
                return s;
            }
        };

        this.max = function(f) {
            if( ! f || typeof f != "string") {
                throw "";
            }
            if(grouped) {
                var e = {};
                for(var k in g) {
                    var m = [];
                    for(var i = 0; i < g[k].length; i++) {
                        m.push(g[k][i][f]);
                    }
                    m.sort(compare);
                    e[k] = m.pop();
                }
                return e;
            } else {
                filter(a, seq);
                var m = [];
                for(var i = 0; i < a.length; i++) {
                    m.push(a[i][f]);
                }
                m.sort(compare);
                return m.pop();
            }
        };

        this.min = function(f) {
            if( ! f || typeof f != "string") {
                throw "";
            }
            if(grouped) {
                var e = {};
                for(var k in g) {
                    var m = [];
                    for(var i = 0; i < g[k].length; i++) {
                        m.push(g[k][i][f]);
                    }
                    m.sort(compare);
                    e[k] = m.shift();
                }
                return e;
            } else {
                filter(a, seq);
                var m = [];
                for(var i = 0; i < a.length; i++) {
                    m.push(a[i][f]);
                }
                m.sort(compare);
                return m.shift();
            }
        };

        this.average = function(f) {
            if( ! f || typeof f != "string") {
                throw "";
            }
            if(grouped) {
                var e = {};
                for(var k in g) {
                    var s = 0;
                    var c = 0;
                    for(var i = 0; i < g[k].length; i++) {
                        var v = g[k][i][f];
                        if(isNumber(v)) {
                            s += Number(v);
                            c++;
                        }
                    }
                    if(c > 0) {
                        e[k] = s / c;
                    } else {
                        e[k] = NaN;
                    }
                }
                return e;
            } else {
                filter(a, seq);
                var s = 0;
                var c = 0;
                for(var i = 0; i < a.length; i++) {
                    var v = a[i][f];
                    if(isNumber(v)) {
                        s += Number(v);
                        c++;
                    }
                }
                if(c > 0) {
                    return s / c;
                } else {
                    return NaN;
                }
            }
        };

        this.count = function() {
            if(grouped) {
                var e = {};
                for(var k in g) {
                    e[k] = g[k].length;
                }
                return e;
            } else {
                filter(a, seq);
                return a.length;
            }
        };

    } // tequila



    function isNumber(v) {
        return /^[\-+]?(?:\d+(?:\.?\d*)?|\d*\.\d+)(?:e[\-+]?\d+)?$/i.test(v) && ! isNaN(Number(v));
    }

    function compare(v1, v2) {
        if(isNumber(v1) && isNumber(v2)) {
            v1 = Number(v1);
            v2 = Number(v2);
        }
        if(v1 > v2) {
            return 1;
        } else if(v1 < v2) {
            return -1;
        }
        return 0;
    }


    function filter(o, seq) {
        for(var i = seq.length - 1; i >= 0; i--) {
            var q = seq.pop();
            if(typeof q.evaluator != "function") {
                throw "evaluator must be a function.";
            }
            if(isObject(o)) {
                for(var k in o) {
                    for(var i = o[k].length - 1; i >= 0; i--) {
                        if( ! q.evaluator(o[k][i])) {
                            o[k].splice(i, 1);
                        }
                    }
                }
            } else if(isArray(o)) {
                for(var i = o.length - 1; i >= 0; i--) {
                    if( ! q.evaluator(o[i])) {
                        o.splice(i, 1);
                    }
                }
            }
        }
        return o;
    }

    function remove(o, seq) {
        for(var i = seq.length - 1; i >= 0; i--) {
            var q = seq.pop();
            if(typeof q.evaluator != "function") {
                throw "evaluator must be a function.";
            }
            if(isObject(o)) {
                for(var k in o) {
                    for(var i = o[k].length - 1; i >= 0; i--) {
                        if(q.evaluator(o[k][i])) {
                            o[k].splice(i, 1);
                        }
                    }
                }
            } else if(isArray(o)) {
                for(var i = o.length - 1; i >= 0; i--) {
                    if(q.evaluator(o[i])) {
                        o.splice(i, 1);
                    }
                }
            }
        }
        return o;
    }

    function map(o, args, seq) {
        filter(o, seq);
        if(args.length == 0) {
            return o;
        }
        var fields = hash(args);
        if(isObject(o)) {
            for(var k in o) {
                translate(o[k], fields);
            }
        } else if(isArray(o)) {
            translate(o, fields);
        }
        return o;
    }


    function translate(o, f) {
        var s = {};
        if(isObject(o)) {
            for(var k in o) {
                for(var i = 0; i < o[k].length; i++) {
                    var e = {};
                    for(var n in o[k][i]) {
                        if(f[n]) {
                            e[n] = o[k][i][n];
                        }
                    }
                    o[k][i] = e;
                }
            }
        } else if(isArray(o)) {
            for(var i = 0; i < o.length; i++) {
                var e = {};
                for(var n in o[i]) {
                    if(f[n]) {
                        e[n] = o[i][n];
                    }
                }
                o[i] = e;
            }
        }
        return o;
    }

    function unique(o) {
        var s = {};
        if(isObject(o)) {
            for(var k in o) {
                for(var i = o[k].length - 1; i >= 0; i--) {
                    var h = digest(o[k][i]);
                    if(s[h]) {
                        o[k].splice(i, 1);
                    } else {
                        s[h] = true;
                    }
                }
            }
        } else if(isArray(o)) {
            for(var i = o.length - 1; i >= 0; i--) {
                var h = digest(o[i]);
                if(s[h]) {
                    o.splice(i, 1);
                } else {
                    s[h] = true;
                }
            }
        }
        return o;
    }


    function isArray(o) {
        return Object.prototype.toString.apply(o) == "[object Array]";
    }

    function isObject(o) {
        return Object.prototype.toString.apply(o) == "[object Object]";
    }

    this.union = function(a, b, all) {
        if( ! isArray(a) || ! isArray(b)) {
            throw "";
        }
        var u = [];
        var s = {};
        for(var i = 0; i < a.length; i++) {
            var e = a[i];
            var h = digest(e);
            if( ! s[h] || all) {
                u.push(e);
                s[h] = true;
            }
        }
        for(var i = 0; i < b.length; i++) {
            var e = b[i];
            var h = digest(e);
            if( ! s[h] || all) {
                u.push(e);
                s[h] = true;
            }
        }
        return u;
    };


    this.intersect = function(a, b) {
        if( ! isArray(a) || ! isArray(b)) {
            throw "";
        }
        var u = [];
        var s = {};
        for(var i = 0; i < a.length; i++) {
            var e = a[i];
            var h = digest(e);
            if( ! s[h]) {
                s[h] = true;
            }
        }
        for(var i = 0; i < b.length; i++) {
            var e = b[i];
            var h = digest(e);
            if(s[h]) {
                u.push(e);
                s[h] = false;
            }
        }
        return u;
    };


    this.except = function(a, b) {
        if( ! isArray(a) || ! isArray(b)) {
            throw "";
        }
        var u = [];
        var s = {};
        for(var i = 0; i < b.length; i++) {
            var e = b[i];
            var h = digest(e);
            if( ! s[h]) {
                s[h] = true;
            }
        }
        for(var i = 0; i < a.length; i++) {
            var e = a[i];
            var h = digest(e);
            if( ! s[h]) {
                u.push(e);
                s[h] = true;
            }
        }
        return u;
    };


    function hash(a) {
        var o = {};
        for(var i = 0; i < a.length; i++) {
            o[a[i]] = true;
        }
        return o;
    }


    function digest(e) {
        var h = [];
        for(var p in e) {
           var v = e[p];
            if(/boolean|number|string/.test(typeof v)) {
                h.push(v);
            } else if(v == null) {
                h.push("null");
            } else if(v.toString()) {
                h.push(v.toString());
            }
        }
        return h.join(";");
    }



    this.parse = function(t, option) {
        var delimiter = (option && option.delimiter && option.delimiter == "\t") ? "\t" : ",";
        var hasHeaders = (option && option.hasHeaders === false) ? false : true;
        var major = (option && option.major && option.major == "column") ? "column" : "row";

        var regex;
        if(delimiter == "\t") {
            regex = /(?:^|\t)(?:"((?:[^"]|"")*)"|([^"\t]*))/g;
        } else {
            regex = /(?:^|,)(?:"((?:[^"]|"")*)"|([^",]*))/g;
        }

        t = t.replace(/\r\n|[\r\n]/g, "\n").split("\n");

        var a = [];

        for(var i = 0; i < t.length; i++) {
            if( ! t[i].replace(/^\s+|\s+$/g, "")) {
                continue;
            }
            var e = [];
            t[i].replace(regex, function(m,s1, s2) {
                e.push(s1 || s2 || "");
            });
            a.push(e);
        }



        // TRANSPOSE
        if(major == "column") {
            var z = [];
            for(var i = 0; i < a.length; i++) {
                for(var j = 0; j < a[i].length; j++) {
                    if( ! z[j]) {
                        z[j] = [];
                    }
                    z[j].push(a[i][j]);
                }
            }
            a = z;
        } 


        if(hasHeaders) {
            var h = a.shift();
            for(var i = 0; i < a.length; i++) {
                var e = {};
                for(var j = 0; j < h.length; j++) {
                    e[h[j]] = (a[i][j]||"");
                }
                a[i] = e;
            }
        } else {
            for(var i = 0; i < a.length; i++) {
                var e = {};
                for(var j = 0; j < a[i].length; j++) {
                    e[j] = (a[i][j]||"");
                }
                a[i] = e;
            }
        }

        return a;

    };



    function trim(t) {
        if( ! t || typeof t != "string") {
            return "";
        }
        return t.replace(/^\s+|\s+$/g, ""); 
    }



}
//----------------------------------------------------------------------------------------------------
function show(o) {

    alert(unescape(o.toSource().replace(/\\u/g, "%u")));

}
//----------------------------------------------------------------------------------------------------