window.JT = function() {

/*
    jt.js - An XSLT-like JSON transform
    @ohashimasaki
    Copyright 2013, Ohashi, Masaki
    Licensed under the MIT license.
    http://opensource.org/licenses/mit-license.php
*/

    var jt = {};

    var data;
    var stylesheet;
    var templateRules;
    var namedTemplateRules;
    var index = {};

    var expr_operators = new RegExp(/[!<>]?=|[<>]/);
    var expr_any = "(?:\\.[^\\.\\[]+|\\[\\d+\\])";
    var expr_stop = "(?=\\.|\\[|$)";


    //---------------------------------------------------------------------
    jt.transform = function(userStylesheet, userData) {

        data = userData;
        stylesheet = userStylesheet;

        createIndex(index, data);

        templateRules = getTemplateRules(stylesheet.match);
        namedTemplateRules = stylesheet.name;

        if(isEmpty(templateRules)) {
            return;
        }

        var result = [];

        if(templateRules["."]) {
            result.push(templateRules["."].call({
                path: ".",
                name: "",
                position: 0,
                type: getType(data)
            }, "."));
        } else {
            //BUILT-IN TEMPLATE RULES
            result.push(jt.select(".").apply());
        }

        return result.join("\r\n");


    };
    //---------------------------------------------------------------------
    jt.select = function(path, filterFunction) {

        var select = {};
        var nodes = {};

        if(index[path]) {
            nodes[path] = path;
        } else {
            nodes = lookup(path).nodes;
        }

        if(isVoid(nodes)) {
            select.apply = function() {
                return null;
            };
            select.value = function() {
                return "";
            };
            select.name = function() {
                return "";
            };
            select.nodeset = function() {
                return null;
            };
            return select;
        }


        if(filterFunction && typeof filterFunction == "function") {
            for(var e in nodes) {
                if( ! filterFunction(e, index[e])) {
                    delete nodes[e];
                }
            }
        }

        var selection = [];
        for(var e in nodes) {
            selection.push({
                path: e,
                value: index[e]
            });
        }

        select.apply = function() {
            var param = getParam(arguments);
            var sort = getSortFunction(arguments);
            if(sort) {
                selection.sort(sort);
            }
            var result = [];
            var template, e;
            for(var i = 0, length = selection.length; i < length; i++) {
                e = selection[i].path;
                template = templateRules[e];
                if(template) {
                    result.push(template.call({
                        path: e,
                        name: e.split(".").pop(),
                        //text: unescapeJSON(index[e]),
                        position: i,
                        type: getType(index[e]),
                        value: function() {
                            var joiner = getParam(arguments);
                            return getValue(index[e], joiner);
                        }
                    }, param));
                } else {
                    result.push(applyBuiltInTemplateRules(e, param));
                }
            }
            return result.join("\r\n");
        };


        select.value = function() {
            var joiner = getParam(arguments);
            var sort = getSortFunction(arguments);
            if(sort) {
                selection.sort(sort);
            }
            var values = [];
            if(typeof joiner == "string") {
                for(var i = 0, length = selection.length; i < length; i++) {
                    values.push(getValue(selection[i].value, joiner));
                }
                return values.join(joiner);
            } else {
                for(var i = 0, length = selection.length; i < length; i++) {
                    values.push(selection[i].value);
                }
                return values;
            }
        };

        select.name = function() {
            var joiner = getParam(arguments);
            var sort = getSortFunction(arguments);
            if(sort) {
                selection.sort(sort);
            }
            var names = [];
            for(var i = 0, length = selection.length; i < length; i++) {
                names.push(unescapeJSON(selection[i].path.split(".").pop()));
            }
            if(typeof joiner == "string") {
                return names.join(joiner);
            } else {
                return names;
            }
        };

        select.nodeset = function() {
            var sort;
            if(arguments.length > 0 && typeof arguments[0] == "function") {
                sort = arguments[0];
            }
            if(sort) {
                selection.sort(sort);
            }
            return selection;
        };


        return select;



        function getSortFunction(args) {
            if(args.length == 1 && typeof args[0] == "function") {
                return args[0];
            } else if(args.length > 1 && typeof args[1] == "function") {
                return args[1];
            }
        }

        function getParam(args) {
            if(args.length == 1 && typeof args[0] != "function") {
                return args[0];
            } else if(args.length > 1) {
                return args[0];
            }
        }

        function isVoid(o) {
            for(var e in o) {
                return false;
            }
            return true;
        }


    }
    //---------------------------------------------------------------------
    jt.call = function(name, param) {

        if(name && namedTemplateRules[name]) {
            return namedTemplateRules[name](param);
        }

    };
    //---------------------------------------------------------------------

    return jt;


    //---------------------------------------------------------------------
    function getTemplateRules(matchPatterns) {

        var rules = {};
        var template;
        var twigs;
       

        for(var pattern in matchPatterns) {
            if(/\.\.|\^|\~/.test(pattern)) {
                throw "Invalid match pattern: Cannot use '..', '^', '~'.";
            }
            template = matchPatterns[pattern];
            pattern = trim(pattern.split(","));
            for(var i = 0; i < pattern.length; i++) {
                if(pattern == ".") {
                    rules["."] = template;
                } else {
                    twigs = follow(index, undefined, splitPath(pattern[i]));
                    for(var e in twigs.nodes) {
                        rules[e] = template;
                    }
                }
            }
        }

        return rules;

    }
    //---------------------------------------------------------------------
    function applyBuiltInTemplateRules(path, param) {

        var result = [];
        var object = index[path];

        if(isObject(object)) {
            for(var e in object) {
                result.push(jt.select(path + "." + e).apply(param));
            }
            return result.join("\r\n");
        } else if(isArray(object)) {
            for(var i = 0; i < object.length; i++) {
                result.push(jt.select(path + "["+ i + "]").apply(param));
            }
        } else if(object === undefined) {
            result.push("");
        } else {
            result.push(object.toString());
        }

        return result.join("\r\n");

    }
    //---------------------------------------------------------------------
    function getValue(object, joiner) {

        if(isArray(object)) {
            var d = [];
            for(var i = 0; i < object.length; i++) {
                d.push(getValue(object[i], joiner));
            }
            if(joiner) {
                return d.join(joiner);
            } else {
                return d;
            }
        } else if(isObject(object)) {
            var d = [];
            for(var e in object) {
                d.push(getValue(object[e], joiner));
            }
            if(joiner) {
                return d.join(joiner);
            } else {
                return d;
            }
        } else {
            return unescapeJSON(object);
        }

    }
    //---------------------------------------------------------------------
    function createIndex(index, object, path) {

        if( ! path) {
            path = ".";
        }

        index[path] = object;

        if(isObject(object)) {
            for(var e in object) {
                createIndex(index, object[e], path.replace(/\.$/g, "") + "." + escapeSigns(e));
            }
        } else if(isArray(object)) {
            for(var i = 0; i < object.length; i++) {
                createIndex(index, object[i], path.replace(/\.$/g, "") + "[" + i + "]");
            }
        }

    }
    //---------------------------------------------------------------------
    function lookup(path) {

        path = path.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]");
        path = path.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
        path = path.replace(/\s+\||\|\s+/g, "|");
        path = path.replace(/\[\s*\]|\(\s*\)/g, "");
        path = path.replace(/\.+\[/g, "[");

        var steps = splitPath(path);
        var stems = {"":""};

        var context = follow(index, stems, steps);
        return context;

    }
    //---------------------------------------------------------------------
    function follow(superset, stems, steps) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var clause = new Clause;
        var pattern;
        var name, queries;
        var current, twigs;
        var path, p, s, e, m;


        var step = steps.shift();
        step = clause.wrap(step);

        var expr = step.split("\t");
        var nametest = trim(strip(clause.unwrap(expr.shift())).split("|"));
        var predicate = clause.unwrap(trim(expr).join("") || "");

        if( ! stems) {
            stems = {};
            for(var i = 0; i < nametest.length; i++) {
                name = trim(nametest[i].split("[")[0]);
                pattern = "(?:^|\\.)" + name + "(?:\\.|\\[|$)";
                var q = [];
                for(var e in index) {
                    if((new RegExp(pattern)).test(e)) {
                        union(stems, cue(e, name));
                    }
                }
            }
            if(isEmpty(stems)) {
                stems[""] = "";
            }
        }

        for(var stem in stems) {
            current = {
                shoots: {},
                nodes: {}
            };

            for(var i = 0; i < nametest.length; i++) {
                name = trim(nametest[i].split("[")[0]);
                queries = splitFilter(nametest[i] + predicate);

                if(name.indexOf("^") == 0) {
                    name = trim(name.replace(/^\^/, "")).replace(/^\*$/, "");
                    path = new Path(stem);
                    p = path.particles();
                    p.pop(); // self
                    if(name == "" || p[p.length - 1] == name) {
                        p = p.join(".").replace(/\.\[/g, "[");
                        s = {};
                        s[p] = p;
                        twigs = follow(index, s, [predicate]);
                        if(twigs) {
                            charge(current, twigs);
                        }
                    }

                } else if(name.indexOf("~") == 0) {
                    name = trim(name.replace(/^~/, ""));
                    path = new Path(stem);
                    p = path.particles();
                    p.pop();
                    if(name == "*") {
                        p = increment(p, ".");
                        for(var e in p) {
                            s = {};
                            s[e] = e;
                            twigs = follow(index, s, [predicate]);
                            if(twigs) {
                                charge(current, twigs);
                            }
                        }
                    } else {
                        while(p.length > 1) {
                            if(p.pop() == name) {
                                s = p.join(".").replace(/\.\[/g, "[");
                                pattern = "(" + escape(s) + "\\." + name + ")" + expr_stop;
                                twigs = match(index, pattern);
                                charge(current, twigs);
                            }
                        }
                    }

                } else if(name.indexOf(".") == 0) {
                    name = trim(name.replace(/^\./, ""));
                    if(name == "*") {
                        pattern = "(" + escape(stem) + ")" + expr_stop;
                        p = match(superset, pattern).shoots;
                        delete p[stem];
                        for(var e in p) {
                            s = {};
                            s[e] = e;
                            twigs = follow(index, s, [predicate]);
                            if(twigs) {
                                charge(current, twigs);
                            }
                        }
                    } else {
                        pattern = "(" + escape(stem) + expr_any + "*" + "\\." + name + ")" + expr_stop;
                        twigs = match(superset, pattern);
                        charge(current, twigs);
                    }

                } else {
                    pattern = "(" + sprout(stem, name) + ")" + expr_stop;
                    twigs = match(superset, pattern);
                    charge(current, twigs);
                }

                if(queries.length > 0) {
                    var twigs = filter(current.shoots, current.nodes, queries);
                    charge(branches, twigs);
                } else {
                    charge(branches, current);
                }
            }
        }


        if(steps.length == 0) {
            return {
                shoots: branches.shoots,
                nodes: branches.nodes
            }
        } else {
            return follow(branches.shoots, branches.nodes, steps);
        }


    }
    //---------------------------------------------------------------------
    function filter(superset, stems, queries) {

        var query = queries.shift();
        query = strip(query);

        var exceptive;
        if(query.indexOf("!") == 0 && ! /\s+(and|or)\s+/.test(query)) {
            var q = trim(query.replace(/^!+/g, ""));
            if( ! expr_operators.test(q) && ! /[\*\|\[\]\(\)]/.test(q)) {
                exceptive = true;
                query = q;
            }
        }

        var negative = false;
        if(/^not\(/.test(query) && query.replace(/^not\(|\)$/g, "") == strip(query.replace(/^not/, ""))) {
            negative = true;
            exceptive = false;
            query = query.replace(/^not\(|\)$/g, "");
        }

        var clause = new Clause;
        var escapedQuery = clause.wrap(query);
        var escaped = (query != escapedQuery);

        var branches = {
            shoots: {},
            nodes: {}
        };

        if(escapedQuery.indexOf(" and ") >= 0 || escapedQuery.indexOf(" or ") >= 0) {
            // RECURSIVE
            branches = filter_logical(superset, stems, clause, escapedQuery, negative);

        } else if(query == "?") {
            // ARRAYABLE
            branches = filter_arrayable(superset, stems, queries, negative);

        } else if(query == "*") {
            // WILDCARD
            branches = filter_wildcard(superset, stems, queries, negative);

        } else if(/^(?:\d+|\$)$/.test(query)) {
            // INTEGER
            branches = filter_integer(superset, stems, queries, query, negative, exceptive);

        } else if( ! expr_operators.test(escapedQuery)) {
            // NODENAME
            branches = filter_nodename(superset, stems, query, escaped, negative, exceptive);

        } else if(expr_operators.test(query)) {
            // FORMULA
            branches = filter_formula(superset, stems, clause, escapedQuery, escaped, negative);
        }

        if(queries.length > 0) {
            var twigs = filter(superset, stems, queries);
            intersection(branches.shoots, twigs.shoots);
            intersection(branches.nodes, twigs.nodes);
        }

        return {
            shoots: branches.shoots,
            nodes: branches.nodes
        };


    }
    //---------------------------------------------------------------------
    function filter_logical(superset, stems, clause, query, negative) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var context = {
            shoots: {},
            nodes: {}
        };

        var subset, twigs, qand;
        var qor = trim(query.split(" or "));

        for(var j = 0; j < qor.length; j++) {
            subset = {
                shoots: {},
                nodes: {}
            };

            qand = trim(qor[j].split(" and "));
            for(var i = 0; i < qand.length; i++) {
                qand[i] = clause.unwrap(qand[i]);
                twigs = filter(superset, stems, [strip(qand[i])]);
                if(i == 0) {
                    charge(subset, twigs);
                } else {
                    intersection(subset.shoots, twigs.shoots);
                    intersection(subset.nodes, twigs.nodes);
                }
            }
            charge(context, subset);
        }

        if(negative) {
            charge(branches, shoot(context.nodes, superset, true), prune(context.nodes, stems, true));
        } else {
            charge(branches, context);
        }

        return branches;


    }
    //---------------------------------------------------------------------
    function filter_arrayable(superset, stems, queries, negative) {

        if(negative) {
            throw "'?'(Arrayable filter) does not have any expression for negation.";
        }

        var branches = {
            shoots: {},
            nodes: {}
        };

        var context = {
            shoots: {},
            nodes: {}
        };

        var twigs;
        var pattern;

        for(var stem in stems) {
            if(isArray(index[stem])) {
                var pattern = "^(" + escape(stem) + "\\[\\d+\\])";
                twigs = match(superset, pattern);
                charge(context, twigs.shoots, twigs.nodes);
            } else {
                charge(context, shoot(stem, superset), stem);
            }
        }

        if(queries.length > 0) {
            twigs = filter(context.shoots, context.nodes, queries);
            charge(branches, twigs);
        } else {
            charge(branches, context);
        }

        return branches;


    }
    //---------------------------------------------------------------------
    function filter_wildcard(superset, stems, queries, negative) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var context = {
            shoots: {},
            nodes: {}
        };

        var twigs;

        var base = "^(?:" + escape(stems) + ")";
        var pattern = "(" + base + ")(?:\\.[^\\.\\[]+|(\\[\\d+\\]))";
        twigs = match(superset, pattern);
        if(negative) {
            if( ! isEmpty(twigs)) {
                charge(context, shoot(twigs.nodes, superset, true), prune(twigs.nodes, stems, true));
            } else {
                charge(context, superset, stems);
            }
        } else {
            charge(context, twigs);
        }


        if(queries.length > 0) {
            twigs = filter(context.shoots, context.nodes, queries);
            charge(branches, twigs);
        } else {
            charge(branches, context);
        }

        return branches;


    }
    //---------------------------------------------------------------------
    function filter_integer(superset, stems, queries, query, negative, exceptive) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var context = {
            shoots: {},
            nodes: {}
        };

        var pattern;
        var twigs;

        for(var stem in stems) {
            if(isArray(index[stem])) {
                if(query == "$") {
                    query = index[stem].length - 1;                   
                }
                if(negative || exceptive) {
                    pattern = "(" + escape(stem) + "\\[(?!" + query + "\\])\\d+\\])" + expr_stop;
                } else {
                    pattern = "(" + escape(stem) + "\\[" + query + "\\])" + expr_stop;
                }
                twigs = match(superset, pattern);
                charge(context, twigs);

                if(queries.length > 0) {
                    twigs = filter(context.shoots, context.nodes, queries);
                    charge(branches, twigs);
                } else {
                    charge(branches, context);
                }
            } else {
                if(exceptive) {
                    pattern = "(?:^|\.)" + query + "$";
                    for(var e in stems) {
                        if( ! (new RegExp(pattern)).test(e)) {
                            branches.nodes[e] = e;
                        } else {
                            twigs[e] = e;
                        }
                    }
                    union(branches.shoots, shoot(twigs, superset, true));

                } else {
                    pattern = "(" + escape(stem) + ")\\." + query + expr_stop;
                    twigs = match(superset, pattern);
                    if(negative) {
                        charge(branches, shoot(twigs.nodes, superset, true), prune(twigs.nodes, stems, true));
                    } else {
                        charge(branches, twigs);
                    }
                }
            }
        }

        return branches;


    }
    //---------------------------------------------------------------------
    function filter_nodename(superset, stems, query, escaped, negative, exceptive) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var base = "^(?:" + escape(stems) + ")";
        var twigs = {};


        if(exceptive) {
            var context = {};
            for(var e in stems) {
                if( ! (new RegExp("\." + query + "$")).test(e)) {
                    context[e] = e;
                }
            }
            union(branches.shoots, shoot(context, superset));
            union(branches.nodes, context);

        } else if(escaped) {
            twigs = follow(superset, stems, splitPath(query));
            if(negative) {
                if(isEmpty(twigs)) {
                    charge(branches, superset, stems);
                } else {
                    if(/\^|~/.test(query)) {
                        charge(branches, shoot(twigs.shoots, superset, true), shoot(twigs.nodes, stems, true));
                    } else {
                        var nonstems = prune(twigs.nodes, stems, true);
                        charge(branches, shoot(nonstems, superset), nonstems);
                    }
                }
            } else {
                if( ! isEmpty(twigs)) {
                    if(/\^|~/.test(query)) {
                        charge(branches, superset, stems);
                    } else {
                        charge(branches, shoot(twigs.shoots, superset), prune(twigs.nodes, stems));
                    }
                }
            }

        } else if(query.indexOf("^") >= 0 || query.indexOf("~") >= 0) {
            twigs = follow(superset, stems, splitPath(query));
            if(negative) {
                if(isEmpty(twigs)) {
                    charge(branches, superset, stems);
                } else {
                    var nonstems = prune(stems, twigs.nodes, true);
                    charge(branches, shoot(nonstems, superset), nonstems);
                }
            } else {
                if( ! isEmpty(twigs)) {
                    charge(branches, superset, stems);
                }
            }

        } else if(query.indexOf("..") >= 0) {
            twigs = follow(superset, stems, splitPath(query));
            if(negative) {
                if(isEmpty(twigs)) {
                    charge(branches, superset, stems);
                } else {
                    var nonstems = prune(twigs.nodes, stems, true);
                    charge(branches, shoot(nonstems, superset), nonstems);
                }
            } else {
                if( ! isEmpty(twigs)) {
                    charge(branches, shoot(stems, twigs.shoots), prune(twigs.nodes, stems));
                }
            }

        } else {
            var t = ("\\." + escape(query)).replace(/\\.\*/g, expr_any);
            var pattern = "(" + base + ")" + t + expr_stop;
            twigs = match(superset, pattern);
            if(negative) {
                if(isEmpty(twigs)) {
                    charge(branches, superset, stems);
                } else {
                    charge(branches, shoot(twigs.nodes, superset, true), prune(twigs.nodes, stems, true));
                }
            } else {
                charge(branches, twigs);
            }
        }

        return branches;


    }
    //---------------------------------------------------------------------
    function filter_formula(superset, stems, clause, query, escaped, negative) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var context = {
            shoots: {},
            nodes: {}
        };

        var base = "^(?:" + escape(stems) + ")";

        var operator = (query.match(expr_operators) || [])[0];
        var q = trim(query.split(operator));
        var term = clause.unwrap(q[0]);
        var value = q[1].replace(/^'|'$/g, "");

        var twigs, steps, step, t;


        if(escaped && operator.indexOf("?") < 0) {
            steps = splitPath(term);
            if(operator != "" || value != "") {
                step = steps[steps.length - 1] + "[" + operator + value + "]";
                steps[steps.length - 1] = step;
            }
            twigs = follow(superset, stems, splitPath(term));
            charge(branches, shoot(twigs.nodes, superset), prune(twigs.nodes, stems));

        } else if(term.indexOf("^") >= 0 || term.indexOf("~") >= 0 || term.indexOf("..") >= 0) {
            value = clause.unwrap(value);
            twigs = follow(superset, stems, splitPath(term));
            if(negative) {
                if(isEmpty(twigs)) {
                    charge(branches, superset, stems);
                } else {
                    for(var e in twigs.nodes) {
                        if(compare(operator, index[e], value)) {
                            context.nodes[e] = e;
                        }
                    }
                    if(isEmpty(context.nodes)) {
                        charge(branches, superset, stems);
                    }
                }
            } else {
                if( ! isEmpty(twigs)) {
                    for(var e in twigs.nodes) {
                        if(compare(operator, index[e], value)) {
                            context.nodes[e] = e;
                        }
                    }
                    if( ! isEmpty(context.nodes)) {
                        charge(branches, superset, stems);
                    }
                }
            }

        } else if(term == "") {
            value = clause.unwrap(value);
            var pattern;

            for(var stem in stems) {
                // ARRAY
                if(isArray(index[stem]) && /^\d+$/.test(value)) {
                    operator = negate(operator, negative);
                    pattern = "^(" + escape(stem) + "\\[\\d+\\])$";
                    twigs = match(superset, pattern);
                    for(var e in twigs.nodes) {
                        if(compare(operator, getLastParticle(e), value)) {
                            branches.nodes[e] = e;
                        }
                    }
                    union(branches.shoots, shoot(branches.nodes, superset));

                } else {
                    // NODE
                    pattern = "^(" + escape(stem) + ")" + expr_stop;
                    twigs = match(superset, pattern);
                    if(negative) {
                        if(isEmpty(twigs)) {
                            charge(branches, superset, stems);
                        } else {
                            for(var e in twigs.nodes) {
                                if( ! compare(operator, index[e], value)) {
                                    branches.nodes[e] = e;
                                }
                            }
                            union(branches.shoots, shoot(branches.nodes, superset));
                        }

                    } else {
                        if( ! isEmpty(twigs)) {
                            for(var e in twigs.nodes) {
                                if(compare(operator, index[e], value)) {
                                    branches.nodes[e] = e;
                                }
                            }
                            union(branches.shoots, shoot(branches.nodes, superset));
                        }
                    }
                }
            }

        } else {
            //operator = negate(operator, negative);
            value = clause.unwrap(value);
            t = ("\\." + escape(term)).replace(/\\.\*/g, expr_any);
            pattern = "(" + base + t + ")" + expr_stop;
            twigs = match(superset, pattern);

            if(negative) {
                if(isEmpty(twigs)) {
                    charge(branches, superset, stems);
                } else {
                    for(var e in twigs.nodes) {
                        if( ! compare(operator, index[e], value)) {
                            context.nodes[e] = e;
                        }
                    }
                    charge(branches, shoot(context.nodes, superset), prune(context.nodes, stems));
                }

            } else {
                if( ! isEmpty(twigs)) {
                    for(var e in twigs.nodes) {
                        if(compare(operator, index[e], value)) {
                            context.nodes[e] = e;
                        }
                    }
                    charge(branches, shoot(context.nodes, superset), prune(context.nodes, stems));
                }
            }
        }

        return branches;


        function getLastParticle(path) {
            return trim(e.split(".").pop().split("[").pop().replace("]", ""));
        }


    }
    //---------------------------------------------------------------------
    function compare(operator, left, right) {

        if(/^null$/i.test(right) && left === null) {
            left = "null";
        }

        if(/^(?:true|false)$/.test(right) && typeof left == "boolean") {
            left = left.toString();
        }

        if(/^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?$/i.test(left)) {
            left = Number(left);
        }

        if(/^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?$/i.test(right)) {
            right = Number(right);
        }

        if(operator == "=" && left === right) {
            return true;
        } else if(operator == "!=" && left !== right) {
            return true;
        } else if(operator == "<" && left < right) {
            return true;
        } else if(operator == ">" && left > right) {
            return true;
        } else if(operator == "<=" && left <= right) {
            return true;
        } else if(operator == ">=" && left >= right) {
            return true;
        }

        return false;


    }
    //---------------------------------------------------------------------
    function shoot(shortpaths, longpaths, negative) { // get paths' offshoots out of set

        if(typeof shortpaths == "string") {
            var n = shortpaths;
            shortpaths = {};
            shortpaths[n] = n;
        }

        if(typeof longpaths == "string") {
            var n = longpaths;
            longpaths = {};
            longpaths[n] = n;
        }

        var subset = {};
        var found;

        for(var longpath in longpaths) {
            found = false;
            for(var shortpath in shortpaths) {
                if(longpath.indexOf(shortpath + ".") == 0 || longpath.indexOf(shortpath + "[") == 0 || longpath == shortpath) {
                    found = true;
                    break;
                }
            }
            if((negative && ! found) || ( ! negative && found)) {
                subset[longpath] = longpath;
            }
        }

        return subset;

    }
    //---------------------------------------------------------------------
    function prune(longpaths, shortpaths, negative) { // get set's backstems out of paths

        if(typeof shortpaths == "string") {
            var n = shortpaths;
            shortpaths = {};
            shortpaths[n] = n;
        }

        if(typeof longpaths == "string") {
            var n = longpaths;
            longpaths = {};
            longpaths[n] = n;
        }

        var subset = {};
        var found;

        for(var shortpath in shortpaths) {
            found = false;
            for(var longpath in longpaths) {
                if(longpath.indexOf(shortpath + ".") == 0 || longpath.indexOf(shortpath + "[") == 0 || longpath == shortpath) {
                    found = true;
                    break;
                }
            }
            if((negative && ! found) || ( ! negative && found)) {
                subset[shortpath] = shortpath;
            }
        }

        return subset;

    }
    //---------------------------------------------------------------------
    function match(superset, pattern) {

        var branches = {
            shoots: {},
            nodes: {}
        };

        var regex = new RegExp(pattern);
        var match, p;
        var found;

        for(var e in superset) {
            match = e.match(regex);
            if(match) {
                p = (match[1] || "") + (match[2] || "");
                charge(branches, e, p);
                found = true;
            }
        }

        return {
            shoots: branches.shoots,
            nodes: branches.nodes
        };


    }
    //---------------------------------------------------------------------
    function sprout(stem, name) {

        if(name == "*") {
            return "^" + escape(stem) + expr_any;
        } else if(stem == "" && name == "") {
            return "^";
        } else if(stem == "") {
            return "^\\." + name;
        } else if(name == "") {
            return "^" + escape(stem);
        } else {
            return "^" + escape(stem) + "\\." + name;
        }

    }
    //---------------------------------------------------------------------
    function negate(operator, negative) {

        if(negative) {
            switch(operator) {
                case "=": return "!=";
                case "!=": return "=";
                case "<": return ">=";
                case ">": return "<=";
                case "<=": return ">";
                case ">=": return "<";
                default: return operator;
            }
        } else {
            return operator;
        }

    }
    //---------------------------------------------------------------------
    function Clause() {

        var clause = {};
        var sequence = [];

        clause.wrap = function(t) {
            var id;
            sequence.length = 0;

            while (/[\(\)\[\]]/.test(t)) {
                t = t.replace(/\[([^\(\)\[\]]+)\]/g, function(m, s) {
                    id = getId();
                    sequence.push({
                        id: id,
                        value: m
                    });
                    return "\t" + id;
                });
                t = t.replace(/\(([^\(\)\[\]]+)\)/g, function(m, s) {
                    id = getId();
                    sequence.push({
                        id: id,
                        value: m
                    });
                    return "\r" + id;
                });
            }
            return t;
        }

        clause.unwrap = function(t) {
            var pattern = ""
            if(isArray(t)) {
                for(var j = 0; j < t.length; j++) {
                    for(var i = sequence.length; i--;) {
                        t[j] = t[j].replace(new RegExp("[\t\r]?" + sequence[i].id), sequence[i].value);
                    }
                }
            } else {
                for(var i = sequence.length; i--;) {
                    t = t.replace(new RegExp("[\t\r]?" + sequence[i].id), sequence[i].value);
                }
            }
            return t;
        }

        return clause;


        function getId() {
            return "{#" + parseInt((Math.random() * 100000000)).toString(36) + "#}";
        }


    }
    //---------------------------------------------------------------------
    function splitPath(path) {

        path = trim(path);
        path = path.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
        path = path.replace(/\.{2,}/g, ".\t");

        var p = 0, b = 0;
        var c = "";
        var t = [];

        for(var i = 0; i < path.length; i++) {
            c = path.substr(i, 1);
            if(c == "(") {
                p++;
            } else if(c == ")") {
                p--;
            } else if(c == "[") {
                b++;
            } else if(c == "]") {
                b--;
            }
            if(c == "." && p == 0 && b == 0) {
                t.push("\n");
            } else {
                t.push(c)
            }
        }

        if(p > 0) {
            throw "Missing right parenthesis ')' in the path expression.";
        }
        if(p < 0) {
            throw "Missing left parenthesis '(' in the path expression.";
        }
        if(b > 0) {
            throw "Missing right square bracket ']' in the path expression.";
        }
        if(b < 0) {
            throw "Missing left square bracket '[]' in the path expression.";
        }

        return t.join("").replace(/\t/g, ".").split("\n");


    }
    //---------------------------------------------------------------------
    function splitFilter(t) {

        var f = [];
        var e = [];
        var b = 0;
        var c = "";
        var inside = false;


        for(var i = 0; i < t.length; i++) {
            c = t.substr(i, 1);
            if(c == "[" && b == 0) {
                inside = true;
                e.length = 0;
            } else if(c == "]" && b == 1) {
                if(e.length > 0) {
                    f.push(strip(e.join("")));
                }
                inside = false;
            } else if(inside) {
                e.push(c);
            }
            if(c == "[") {
                b++;
            } else if(c == "]") {
                b--;
            }
        }

        return f;

    }
    //---------------------------------------------------------------------
    function strip(t) {

        t = trim(t);

        t = t.replace(/\((?=[^\!\?\:])([^\(\)]*)\)/g, function(m, s) {
            if(( ! expr_operators.test(s) && ! /\s*(?:and|or)\s*/.test(s)) && s.indexOf("|") >= 0) {

                return trim(s);
            } else {
                return m;
            }
        });

        if( ! /^\(/.test(t) || ! /\)$/.test(t)) {
            return t;
        }

        var p = 0;
        var length = t.length;
        var c = "";
        var enclosed = true;

        for(var i = 0; i < t.length; i++) {
            c = t.substr(i, 1);
            if(c == "(") {
                p++;
            } else if(c == ")") {
                p--;
                if(p == 0 && i != t.length - 1) {
                    enclosed = false;
                }
            }
        }

        if(p > 0) {
            throw "Missing right parenthesis ')' in the expression '" + t + "'.";
        } else if(p < 0 ) {
            throw "Missing left parenthesis '(' in the expression '" + t + "'.";
        }

        if(enclosed) {
            t = t.replace(/^\(|\)$/g, "");
        }

        if(t.length == length) {
            return t;
        } else {
            return strip(t);
        }

    }
    //---------------------------------------------------------------------
    function Path(t) {

        var path = {};
        var joiner = ".";
        var steps = disassemble(t);


        function disassemble(t) {
            var a = [];
            var s = t.split(joiner);
            var e, p;

            for(var i = 0; i < s.length; i++) {
                e = s[i].split("[");
                if(e.length == 1) {
                    a.push({
                        step: s[i],
                        particle: [e[0]]
                    });
                } else {
                    p = [];
                    for(var j = 0; j < e.length; j++) {
                        if(j == 0) {
                            p.push(e[j]);
                        } else {
                            p.push("[" + e[j]);
                        }
                    }
                    a.push({
                        step: s[i],
                        particle: p
                    });
                }
            }
            return a;
        }

        path.particles = function() {
            var a = [];
            var p;
            for(var i = 0; i < steps.length; i++) {
                p = steps[i].particle;
                for(var j = 0; j < p.length; j++) {
                    a.push(p[j]);
                }
            }
            return a;
        };

        path.steps = function() {
            var a = [];
            for(var i = 0; i < steps.length; i++) {
                a.push(steps[i].step);
            }
            return a;
        }

        path.pop = function() {
            return steps.pop();
        };

        return path;


    }
    //---------------------------------------------------------------------
    function cue(path, name) {

        steps = path.split(".");
        var cue;
        var cues = {};

        for(var i = 0; i < steps.length; i++) {
            if(steps[i] == name) {
                cue = steps.slice(0, i).join(".");
                cues[cue] = cue;
            }
        }

        return cues;

    }
    //---------------------------------------------------------------------
    function increment(a, joiner) {

        var b = [];
        for(var i = 1; i <= a.length; i++) {
            b.push(a.slice(0, i).join(joiner).replace(/\.\[/g, "["));
        }

        var o = {};
        var e;
        for(var i = b.length; i--;) {
            e = b[i];
            o[e] = e;
        }

        return o;

    }
    //---------------------------------------------------------------------
    function breakup(t) {

        var a = [];
        var s = t.split(".");
        var e, b;

        for(var i = 0; i < s.length; i++) {
            e = s[i];
            if(e.indexOf("[") > 0) {
                b = [e];
                while(/\[\d+\]$/.test(e)) {
                    e = e.replace(/\[\d+\]$/, "");
                    b.push(e);
                }
                for(var j = b.length; j--;) {
                    a.push(b[j]);
                }
            } else {
                a.push(e);
            }
        }

        return a;

    }
    //---------------------------------------------------------------------
    function intersection(a, b) { // MAKE INTERSECTION

        for(var e in a) {
            if( ! b[e]) {
                delete a[e];
            }
        }

    }
    //---------------------------------------------------------------------
    function union(a, b) { // MAKE UNION

        for(var e in b) {
            a[e] = e;
        }

    }
    //---------------------------------------------------------------------
    function charge(a, b, c) {

        if(arguments.length == 3) {
            if(typeof b == "string") {
                a.shoots[b] = b;
            } else if(isObject(b)) {
                union(a.shoots, b);
            }
            if(typeof c == "string") {
                a.nodes[c] = c;
            } else if(isObject(c)) {
                union(a.nodes, c);
            }
        } else if(arguments.length == 2) {
            if(a.shoots && a.nodes && b.shoots && b.shoots) {
                union(a.shoots, b.shoots);
                union(a.nodes, b.nodes);
            }
        }

    }
    //---------------------------------------------------------------------
    function escape(t) {

        this.escape = function(t) {
            t = t.replace(/\./g, "\\.");
            t = t.replace(/\[/g, "\\[");
            t = t.replace(/\]/g, "\\]");
            t = t.replace(/\|/g, "\\|");
            return t;
        };

        if(typeof t == "string") {
            return this.escape(t);
        } else if(isObject(t)) {
            var p = [];
            for(var e in t) {
                p.push(this.escape(e.toString()));
            }
            return p.join("|");
        }

    }
    //---------------------------------------------------------------------
    function unescapeJSON(t) {

        t = t.toString();
        t = t.replace(/\\\//g, "/");
        t = t.replace(/\\r/g, "\r");
        t = t.replace(/\\n/g, "\n");
        t = t.replace(/\\"/g, '"');
        t = t.replace(/\\\\/g, "\\");
        return t; 

    }
    //---------------------------------------------------------------------
    function escapeSigns(t) {

        t = t.replace(/,/g, "%2C");
        t = t.replace(/\./g, "%2E");
        t = t.replace(/\(/g, "%28");
        t = t.replace(/\)/g, "%29");
        t = t.replace(/\[/g, "%5B");
        t = t.replace(/\]/g, "%5D");
        t = t.replace(/\|/g, "%7C");
        return t;

    }
    //---------------------------------------------------------------------
    function unescapeSigns(t) {

        t = t.replace(/%2C/g, ",");
        t = t.replace(/%2E/g, ".");
        t = t.replace(/%28/g, "(");
        t = t.replace(/%29/g, ")");
        t = t.replace(/%5B/g, "[");
        t = t.replace(/%5D/g, "]");
        t = t.replace(/%7C/g, "|");
        return t;

    }
    //---------------------------------------------------------------------
    function isArray(object) {

        return Object.prototype.toString.apply(object) == "[object Array]";

    }
    //---------------------------------------------------------------------
    function isObject(object) {

        return Object.prototype.toString.apply(object) == "[object Object]";

    }
    //---------------------------------------------------------------------
    function isEmpty(object) {

        this.isEmpty = function(object) {
            for(var e in object) {
                if(object.hasOwnProperty(e)) {
                    return false;
                }
            }
            return true;
        };

        if(object.shoots && object.nodes) {
            if(this.isEmpty(object.shoots) && this.isEmpty(object.nodes)) {
                return true;
            }
            return false;
        } else {
            return this.isEmpty(object);
        }

    }
    //---------------------------------------------------------------------
    function trim(t) {

        this.trim = function(t) {
            if(typeof(t) != "string") {
                return "";
            }
            return t.replace(/^[\s　]+|[\s　]+$/g, "");
        }

        if(isArray(t)) {
            var a = [];
            var v;
            for(var i = 0; i < t.length; i++) {
                v = this.trim(t[i]);
                a.push(v);
            }
            return a;
        } else {
            return this.trim(t);
        }

    }
    //---------------------------------------------------------------------
    function getType(e) {

        if(e === null) {
            return "null";
        } else if(isArray(e)) {
            return "array";
        } else if(isObject(e)) {
            return "object";
        } else if(typeof e == "string") {
            return "string";
        } else if(typeof e == "number") {
            return "number";
        } else if(typeof e == "boolean") {
            return "boolean";
        } else {
            return "";
        }

    }
    //---------------------------------------------------------------------


};











































