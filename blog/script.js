(function(namespace) {

    var $entry = [];
    var $category = [];
    var $selected = "";

    var query = parseQuery(location.search);

    $selected = $selected || decodeURIComponent(query.category);

    fetch("category.json", function(data) {
        if(data) {
            $category = data;
            renderIndex(data, $selected);
        }
    }, true, null);


    if(query.id) {
        renderArticle(query.id);
    } else {
        fetch("feed.json", function(data) {
            if(data && data.entry) {
                $entry = data.entry;
                if($selected) {
                    var entry = extract($selected);
                    renderContent(entry);
                } else {
                    renderContent(data.entry);
                }
            }
        }, true, null);
    }



    //----------------------------------------------------------------------------------------------------
    function renderArticle(id) {

        if( ! /^[0-9]{14}$/.test(id)) {
            document.getElementById("content").innerHTML = [
                '<div>ページを表示できません。</div>'
            ].join("\r\n");
        }

        var url = "entries/" + id.substr(0,4) + "/" + id + ".xml";

        fetch(url, function(t) {
            if(t) {
                document.getElementById("content").innerHTML = t;
                var a = document.getElementById("content").getElementsByTagName("article")[0];
                if(a) {
                    var published = a.getAttribute("published");
                    var category = a.getAttribute("category").replace(/,/g, ", ");
                    if(published) {
                        a.insertAdjacentHTML("beforeend", [
                            '<time id="published">' + html(published) + '</time>',
                            '<div id="category">カテゴリー: ' + category + '</div>'
                        ].join("\r\n"));
                    }
                }
                return;
            } else {
                document.getElementById("content").innerHTML = [
                    '<div>ページを表示できません。</div>'
                ].join("\r\n");
            }
        }, false, null);

    }
    //----------------------------------------------------------------------------------------------------
    function renderIndex(data, selected) {

        if( ! data) {
            return;
        }

        var t = [];
        for(var i = 0; i < data.length; i++) {
            var e = data[i];
            if(e.name == selected) {
                selected = true;
                t.push('<li><a href="?category=' + html(e.name) + '" selected="true">' + html(e.name) + ' (' + e.entries.length + ') </a></li>');
            } else {
                t.push('<li><a href="?category=' + html(e.name) + '">' + html(e.name) + ' (' + e.entries.length + ') </a></li>');
            }
        }

        if(selected !== true) {
            selected = false;
            $selected = "";
        }

        document.getElementById("index").innerHTML = [
            '<ul id="categories">',
            '<li>' + (selected ? '<a href="?category=">' : '<a href="?category=" selected="true">') + 'all entries</a></li>',
            t.join("\r\n"),
            '</ul>'
        ].join("\r\n");


    }
    //----------------------------------------------------------------------------------------------------
    function extract(ref) {

        var entry = [];
        var category = $category.filter(function(e) {
            return e.name == ref;
        });

        if( ! category || category.length == 0) {
            return;
        }

        category = category[0].entries;

        for(var i = 0; i < $entry.length; i++) {
            var e = $entry[i];
            if(category.indexOf(e.id) >= 0) {
                entry.push(e);
            }
        }

        return entry;

    }
    //----------------------------------------------------------------------------------------------------
    function renderContent(entry) {

        if( ! entry) {
            return;
        }

        var t = [];
        t.push('<ul id="entries">');
        for(var i = 0; i < entry.length; i++) {
            var e = entry[i];
            t.push([
                '<li>',
                '<h3><a href="?id=' + e.id + '&category=' + $selected + '">' + html(e.title) + '</a></h3>',
                '<div>' + html(e.summary, true) + '...</div>',
                '<time>' + html(e.published) + '</time>',
                '</li>'
            ].join("\r\n"));
        }
        t.push('</ul>');

        document.getElementById("content").innerHTML = t.join("\r\n");

        var titles = document.getElementById("content").getElementsByTagName("a");
        for(var i = 0; i < titles.length; i++) {
            titles[i].onclick = function() {
                location.href = this.getAttribute("href");
            };
        }

    }
    //----------------------------------------------------------------------------------------------------
    function fetch(url, callback, parse, fallback) {

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.overrideMimeType("text/plain");

        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                var t = request.responseText;
                if(parse) {
                    try {
                        var data = JSON.parse(t);
                        callback(data);
                    } catch(ex) {
                        callback(fallback || null);
                    }
                } else {
                    callback(t || "");
                }
            }
        };

        request.send();

    }
    //----------------------------------------------------------------------------------------------------
    function html(t, br) {

        if( ! t || typeof t !== "string") {
            return "";
        }

        t = t.replace(/\\r\\n|(?:\\r|\\n)/g, "\r\n");
        t = t.replace(/\\t/g, " ");
        t = t.replace(/\\"/g, '"');
        t = t.replace(/\\'/g, "'");
        t = t.replace(/\\\//g, "/");

        t = t.replace(/&/g, "&amp;");
        t = t.replace(/'/g, "&apos;");
        t = t.replace(/"/g, "&quot;");
        t = t.replace(/</g, "&lt;");
        t = t.replace(/>/g, "&gt;");

        if(br === true) {
            t = t.replace(/\r\n/g, "<br />");
        }

        return t;

    }
    //----------------------------------------------------------------------------------------------------
    function trim(t) {

        if( ! t || typeof t !== "string") {
            return "";
        }

        return t.replace(/^\s+|\s+$/g, "");

    }
    //----------------------------------------------------------------------------------------------------
    function parseQuery(t) {

        var q = {};

        if( ! t || typeof t !== "string") {
            return q;
        }

        t = trim(t).replace(/^\?/, "").split("&");

        for(var i = 0; i < t.length; i++) {
            var e = t[i].split("=");
            var p = trim(e[0] || "");
            var v = trim(e[1] || "");
            if(p) {
                q[p] = v;
            }
        }

        return q;

    }
    //----------------------------------------------------------------------------------------------------
    function parseDate(t) {

        var date = new Date();

        if(typeof t !== "string" && t !== null) {
            return {
                YYYY: "",
                MM: "",
                DD: "",
                hh: "",
                mm: "",
                ss: "",
                date: ["", "", ""],
                time: ["", "", ""],
                iso8601: ""
            };
        }
        var date = new Date();
        if(typeof t === "string") {
            t = trim(t);
            if(t) {
                var date = new Date(t);
            }
        }

        var year = date.getFullYear();
        var month = ("00" + (date.getMonth() + 1)).slice(-2);
        var day = ("00" + date.getDate()).slice(-2);
        var hour = ("00" + date.getHours()).slice(-2);;
        var minute = ("00" + date.getMinutes()).slice(-2);
        var second = ("00" + date.getSeconds()).slice(-2);

        return {
            YYYY: year,
            MM: month,
            DD: day,
            hh: hour,
            mm: minute,
            ss: second,
            date: [year, month, day],
            time: [hour, minute, second],
            iso8601: [year, month, day].join("-") + "T" + [hour, minute, second].join(":") + "+09:00"
        };

    }
    //----------------------------------------------------------------------------------------------------

})(this);