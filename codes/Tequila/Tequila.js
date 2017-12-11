//----------------------------------------------------------------------------------------------------
function Tequila() {

    this.from = function(d) {
        var a = [];
        for(var i = 0; i < d.length; i++) {
            a[i] = d[i];
        }
        return new _Tequila(a);
    };


    function _Tequila(a) {
        this.where = function(evaluator) {
            if(typeof evaluator != "function") {
                throw "evaluator must be a function.";
            }
            for(var i = a.length - 1; i >= 0; i--) {
                if( ! evaluator(a[i])) {
                    a.splice(i, 1);
                }
            }
            return this;
        };

        this.select = function() {
            if(arguments.length == 0) {
                return a;
            }
            return choose(a, arguments, false);
        };

        this.distinct = function() {
            if(arguments.length == 0) {
                return a;
            }
            return choose(a, arguments, true);
        };

        this.orderby = function() {
            var args = arguments;
            if(args.length < 1 || 2 < args.length) {
                throw "";            
            }
            var f = args[0];
            if(typeof f == "string") {
                a.sort(function(e1, e2) {
                    if(e1[f] == e2[f]) {
                        return 0;
                    }
                    if(args.length == 2 && typeof args[1] == "string" && /^desc(?:ending)?$/i.test(args[1])) {
                        return (e1[f] < e2[f]) ? 1 : -1;
                    } else {
                        return (e1[f] > e2[f]) ? 1 : -1;
                    }
                })
            } else if(typeof f == "function") {
                a.sort(f);
            }
            return this;
        };




    }


    this.union = function(a, b, all) {
        var u = [];
        var s = {};
        for(var i = 0; i < a.length; i++) {
            var e = a[i];
            var h = hash(e);
            if( ! s[h] || all) {
                u.push(e);
                s[h] = true;
            }
        }
        for(var i = 0; i < b.length; i++) {
            var e = b[i];
            var h = hash(e);
            if( ! s[h] || all) {
                u.push(e);
                s[h] = true;
            }
        }
        return u;
    };

    this.intersect = function(a, b) {
        var u = [];
        var s = {};
        for(var i = 0; i < a.length; i++) {
            var e = a[i];
            var h = hash(e);
            if( ! s[h]) {
                s[h] = true;
            }
        }
        for(var i = 0; i < b.length; i++) {
            var e = b[i];
            var h = hash(e);
            if(s[h]) {
                u.push(e);
                s[h] = false;
            }
        }
        return u;
    };

    this.except = function(a, b) {
        var u = [];
        var s = {};
        for(var i = 0; i < b.length; i++) {
            var e = b[i];
            var h = hash(e);
            if( ! s[h]) {
                s[h] = true;
            }
        }
        for(var i = 0; i < a.length; i++) {
            var e = a[i];
            var h = hash(e);
            if( ! s[h]) {
                u.push(e);
                s[h] = true;
            }
        }
        return u;
    };


    this.sum = function() {
    };


    function choose(a, fields, distinct) {
        var _fileds = {};
        for(var i = 0; i < fields.length; i++) {
            _fileds[fields[i]] = true;
        }
        var s = {};
        for(var i = a.length - 1; i >= 0; i--) {
            var e = {};
            for(var f in a[i]) {
                if(_fileds[f]) {
                    e[f] = a[i][f];
                }
            }
            if(distinct) {
                var h = hash(e);
                if( ! s[h]) {
                    a[i] = e;
                    s[h] = true;
                } else {
                    a.splice(i, 1);
                }
            } else {
                a[i] = e;
            }
        }
        return a;
    }



    function hash(e) {
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


}
//----------------------------------------------------------------------------------------------------
function TabularData() {

    this.parse = function(t) {
        var a = [];
        var regex = /(?:^|,)(?:"((?:[^"]|"")*)"|([^",]*))/g;

        t = t.replace(/\r\n|[\r\n]/g, "\n").split("\n");

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

        var c = 0;
        for(var i = 0; i < a.length; i++) {
            var w = a[i].length;
            c = c < w ? w : c;
        }

        var h = a.shift();

        for(var i = 0; i < a.length; i++) {
            var e = {};
            for(var j = 0; j < h.length; j++) {
                e[h[j]] = (a[i][j]||"");
            }
            a[i] = e;
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