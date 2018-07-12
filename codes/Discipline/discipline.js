function Discipline(rules) {

    this.constrain = function() {
        for(var name in rules.default) {
            var props = rules.default[name];
            var elements = find(name);
            change(elements, props, null);
        }
        for(var id in rules) {
            if(id != "default") {
                var rule = rules[id];
                if(rule.when && rule.then) {
                    for(var name in rule.when) {
                         attach(name, id);
                     }
                }
            }
        }
    }


    //----------------------------------------------------------------------------------------------------
    function attach(name, id) {

        var e = document.getElementById(name);
        if(e) {
            if( ! e.disciplineAttached) {
                e.addEventListener("change", function() {
                    affect(this);
                }, false);
                e.disciplineAttached = true;
            }
            if( ! e.disciplineRules) {
                e.disciplineRules = [];
            }
            if(e.disciplineRules.indexOf(id) < 0) {
                e.disciplineRules.push(id);
            }
            return;
        }

        var q = document.querySelectorAll("input[name='" + name + "']");
        for(var i = 0; i < q.length; i++) {
            var e = q[i];
            if(/^radio$/i.test(e.type)) {
                if( ! e.disciplineAttached) {
                    e.addEventListener("change", function() {
                        affect(this);
                    }, false);
                    e.disciplineAttached = true;
                }
                if( ! e.disciplineRules) {
                    e.disciplineRules = [];
                }
                if(e.disciplineRules.indexOf(id) < 0) {
                    e.disciplineRules.push(id);
                }
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function affect(e) {

        var matched = [];
        var unmatched = [];

        for(var i = 0; i < e.disciplineRules.length; i++) {
            var id = e.disciplineRules[i];
            var rule = rules[id];
            if(evaluate(rule.when)) {
                matched.push(id);
            } else {
                unmatched.push(id);
            }
        }

        reset(matched, unmatched);

        for(var i = 0; i < matched.length; i++) {
            var id = matched[i];
            var rule = rules[id];
            for(var name in rule.then) {
                var props = rule.then[name];
                var elements = find(name);
                change(elements, props, e);
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function reset(matched, unmatched) {

        var items = {};

        for(var i = 0; i < unmatched.length; i++) {
            var id = unmatched[i];
            var rule = rules[id];
            for(var name in rule.then) {
                if(name in rules.default) {
                    items[name] = {};
                    var props = rules.default[name];
                    for(var prop in props) {
                        items[name][prop] = rules.default[name][prop];
                    }
                }
            }
        }

        for(var i = 0; i < matched.length; i++) {
            var id = matched[i];
            var rule = rules[id];
            for(var name in rule.then) {
                delete items[name];
            }
        }

        for(var name in items) {
            var props = items[name];
            var elements = find(name);
            change(elements, props, null);
        }

    }
    //----------------------------------------------------------------------------------------------------
    function change(elements, props, src) {

        for(var p in props) {
            if(typeof props[p] == "function") {
                var f = props[p];
                for(var i = 0; i < elements.length; i++) {
                    var e = elements[i];
                    if(p in e) {
                        e[p] = f(src, e);
                    } else if(p in e.style) {
                        e.style[p] = f(src, e);
                    }
                }
            } else {
                var value = props[p];
                for(var i = 0; i < elements.length; i++) {
                    var e = elements[i];
                    if(p in e) {
                        if(/^select$/i.test(e.tagName) && e.getAttribute("cascade")) {
                            e[p] = value;
                            react(e);
                        } else if(/^input$/i.test(e.tagName) && /^radio$/i.test(e.type) && /^value$/i.test(p)) {
                            if(e.value == value) {
                                e.checked = true;
                            }
                        } else {
                            e[p] = value;
                        }
                    } else if(p in e.style) {
                        e.style[p] = value;
                    }
                }
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function evaluate(rule) {

        for(var name in rule) {
            var e = document.getElementById(name) || document.querySelector("input[name='" + name + "']:checked");
            if( ! e) {
                return false;
            } else {
                var props = rule[name];
                for(var prop in props) {
                    var v = props[prop];

                    if(/^(?:=|[!<>]=?)/.test(v)) {
                        var q = /^(=|[!<>]=?)(.*)$/.exec(v);
                        var op = (q == null) ? "=" : (q[1] || "=");
                        var value = (q == null) ? v : (q[2] || "");
                        value = /^(?:true|false)$/i.test(value) ? /^true$/i.test(value) : value;
                    } else {
                        var op = "=";
                        var value = trim(v);
                    }

                    if(prop in e && ! compare(e[prop], value, op)) {
                        return false;
                    } else if(prop in e.style && ! compare(e.style[prop], value, op)) {
                        return false;
                    } else if( ! (prop in e || prop in e.style)) {
                        return false;
                    }
                }
            }
        }

        return true;

    }
    //----------------------------------------------------------------------------------------------------
    function compare(a, b, op) {

        if(op == "=" && a == b) {
            return true;
        } else if(op == "!" && a != b) {
            return true;
        } else if(op == "!=" && a != b) {
            return true;
        } else if(op == "<" && a < b) {
            return true;
        } else if(op == "<=" && a <= b) {
            return true;
        } else if(op == ">" && a > b) {
            return true;
        } else if(op == ">=" && a >= b) {
            return true;
        } else {
            return false;
        }

    }
    //----------------------------------------------------------------------------------------------------
    function find(name) {

        var q = [];

        var e = document.getElementById(name);
        if(e) {
            q.push(e);
        }

        var e = document.querySelectorAll("input[name='" + name + "']");
        for(var i = 0; i < e.length; i++) {
            if(/^radio$/i.test(e[i].type)) {
                q.push(e[i]);
            }
        }

        return q;

    }
    //----------------------------------------------------------------------------------------------------
    function trim(t) {

        if(t == null || typeof t != "string") {
            return t;
        }

        return t.replace(/^\s+|\s+$/g, "");

    }
    //----------------------------------------------------------------------------------------------------


}








































