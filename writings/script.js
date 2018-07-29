(function() {

    var query = parseQuery(location.search);

    fetch("Pages.txt").then(function(t) {
        list(document.getElementById("pages"), t.split(/\r\n|[\r\n]/), "Pages");
        fetch("Tags.txt").then(function(t) {
            list(document.getElementById("tags"), t.split(/\r\n|[\r\n]/), "Tags");
            selectPage();
        });
    });


//----------------------------------------------------------------------------------------------------
function selectPage() {

    if(query) {
        if(query.params["page"]) {
            var id = "Pages/" + query.params["page"];
            if(document.getElementById(id)) {
                show(id);
                return;
            }
        } else if(query.params["tag"]) {
            var id = "Tags/" + query.params["page"];
            if(document.getElementById(id)) {
                show(id);
                return; 
            }
        }
    }

    var e = document.getElementById("pages").getElementsByTagName("li")[0];
    if(e) {
        var id = e.getAttribute("id");
        if(document.getElementById(id)) {
            show(id);
        }
    }

}
//----------------------------------------------------------------------------------------------------
function list(u, a, h) {

    var page = a[0].split("/").pop();

    var t = [];

    t.push('<h3 ref="' + html(h) + '">' + html(h) + '</h3>');

    t.push('<ul id="' + html(h) + '">');
    for(var i = 0; i < a.length; i++) {
        var e = a[i];
        var id = e.split("\t")[0];
        var name = e.split("\t")[1];
        t.push('<li id="' + html(id) + '">' + html(name) + '</li>\r\n');
    }
    t.push('</ul>');

    u.innerHTML = t.join("\r\n");

    var e = u.getElementsByTagName("li");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            var id = this.getAttribute("id");
            show(id);
        }, false);
    }

    var e = u.getElementsByTagName("h3");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            var style = document.defaultView.getComputedStyle(this, "cursor");
            if(style.cursor == "pointer") {
                var ul = document.getElementById(this.getAttribute("ref"));
                if(ul.style.display != "block") {
                    ul.style.display = "block";
                } else {
                    ul.style.display = "none";
                }
            }
        }, false);
    }


}
//----------------------------------------------------------------------------------------------------
function page(u, a, id) {

    var e = document.getElementById(id);
    var h = e ? e.innerText : "";

    var t = [];

    t.push('<h2>' + html(h) + '</h2>');

    for(var i = 0; i < a.length; i++) {
        var e = a[i].split("\t");
        t.push('<section class="fold" id="' + html(e[0]) + '">');
        t.push('<h3>' + html(e[2]) + '</h3>\r\n');
        t.push('<div class="entry" id="' + html(e[0]) + '-entry"></div>\r\n');
        t.push('<div class="date">' + html(e[1]) + '</div>\r\n');
        if(i > 5) {
            t.push('<div class="top">Back to top</div>\r\n');
        }
        t.push('</section>');
    }

    u.innerHTML = t.join("\r\n");

    var e = u.getElementsByTagName("section");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            if(this.className == "fold") {
                var id = this.getAttribute("id"); 
                unfold(id);
            }
        }, false);
    }

    var e = u.getElementsByClassName("top");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            document.documentElement.scrollTop = 0;
        }, false);
    }


    var page_id = id.split("/").pop();
    var page_type = /Tags/.test(id) ? "tag" : "page";
    var section_id = query.params["id"];

    if(section_id) {
        history.replaceState("", "", "?" + html(page_type) + "=" + html(page_id) + "&id=" + html(section_id));
    } else {
        history.replaceState("", "", "?" + html(page_type) + "=" + html(page_id));
    }

    if(section_id && /^[0-9a-f]{32}$/i.test(section_id)) {
        var e = document.getElementById(section_id);
        if(e) {
            e.scrollIntoView();
            if(e.className == "fold") {
                unfold(section_id);
            }
        }
    }


}
//----------------------------------------------------------------------------------------------------
function unfold(id) {

    var url = "Sections/" + id.substr(0, 2) + "/" + id.substr(2) + ".txt";

    fetch(url).then(function(t) {
        var e = document.getElementById(id + "-entry");
        e.innerHTML = html(t, true);
        e.parentNode.className = "";

        var q = parseQuery(location.search);
        q.params["id"] = id;
        var p = q.join();
        history.replaceState("", "", "?" + p);
    });

}
//----------------------------------------------------------------------------------------------------
function show(id) {

    var url = id + ".txt";

    fetch(url).then(function(t, options) {
        page(document.getElementById("content"), t.split(/\r\n|[\r\n]/), id);
    });

}
//----------------------------------------------------------------------------------------------------
function fetch(url) {

    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);

        request.onload = function() {
            if(request.status == 200) {
                resolve(trim(request.responseText));
            } else {
                reject(Error(request.statusText));
            }
        };
        request.onerror = function() {
            reject(Error("Network Error"));
        };

        request.send();
    });

}
//----------------------------------------------------------------------------------------------------
function parseQuery(t) {

    var query = {};
    var params = {};

    if(typeof t != "string") {
        return null;
    }

    t = t.replace(/^\?/, "").split("&");

    for(var i = 0; i < t.length; i++) {
        var e = t[i].split("=");
        var p = trim(e[0] || "");
        var v = trim(e[1] || "");
        params[p] = v;
    }

    query.params = params;

    query.join = function() {
        var t = [];
        for(var p in params) {
            t.push(p + "=" + params[p]);
        }
        return t.join("&");
    };   


    return query;

}
//----------------------------------------------------------------------------------------------------
function html(t, br) {

    if(typeof t != "string") {
        return "";
    }

    t = t.replace(/&(?!(?:amp|quot|apos|#0*39|lt|gt);)/g, "&amp;");
    t = t.replace(/"/g, "&quot;");
    t = t.replace(/'/g, "&#39;");
    t = t.replace(/</g, "&lt;");
    t = t.replace(/>/g, "&gt;");

    if(br === true) {
        t = t.replace(/\\r\\n|\\r|\\n/ig, "\r\n");
        t = t.replace(/\r\n|\r|\n/ig, "<br />\r\n");
    }

    return t;

}
//----------------------------------------------------------------------------------------------------
function trim(t) {

    if(typeof t != "string") {
        return t;
    }

    return t.replace(/^\s+|\s+$/g, "");

}
//----------------------------------------------------------------------------------------------------

}())