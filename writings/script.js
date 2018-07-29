(function() {

    var index = {};

    fetch("Pages.txt").then(function(t) {
        list(document.getElementById("pages"), t.split(/\r\n|[\r\n]/), "Pages");
        fetch("Tags.txt").then(function(t) {
            list(document.getElementById("tags"), t.split(/\r\n|[\r\n]/), "Tags");
            selectPage();
        });
    });



//----------------------------------------------------------------------------------------------------
function selectPage() {

    var query = parseQuery(location.search);

    if(query) {
        if(query["page"]) {
            var id = "Pages/" + query["page"];
            if(document.getElementById(id)) {
                show(id);
                return;
            }
        } else if(query["tag"]) {
            var id = "Tags/" + query["page"];
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
function parseQuery(t) {

    var q = {};

    if(typeof t != "string") {
        return null;
    }

    t = t.replace(/^\?/, "").split("&");

    for(var i = 0; i < t.length; i++) {
        var e = t[i].split("=");
        var p = trim(e[0] || "");
        var v = trim(e[1] || "");
        q[p] = v;
    }

    return q;

}
//----------------------------------------------------------------------------------------------------
function list(u, a, h) {

    var page = a[0].split("/").pop();

    var t = [];

    t.push('<h3 ref="' + html(h) + '">' + html(h) + '</h3>');
    t.push('<ul id="' + html(h) + '">');
    for(var i = 0; i < a.length; i++) {
        var e = a[i];
        v = e.split("/").pop();
        t.push('<li id="' + html(e) + '">' + html(v) + '</li>\r\n');
    }
    t.push('</ul>');

    u.innerHTML = t.join("\r\n");

    var e = u.getElementsByTagName("li");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            show(this.getAttribute("id"));
        }, false);
    }

    var e = u.getElementsByTagName("h3");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            var ul = document.getElementById(this.getAttribute("ref"));
            if(ul && ul.style.display != "block") {
                ul.style.display = "block";
            } else {
                ul.style.display = "none";
            }
        }, false);
    }


}
//----------------------------------------------------------------------------------------------------
function page(u, a, h) {

    var hash = location.hash;

    var path = h.split("/");
    var page = path.pop();
    path = path == "Tags" ? "tag" : "page";

    history.replaceState("", "", "?" + html(path) + "=" + html(page));


    var t = [];
    t.push('<h2>' + html(h) + '</h2>');

    for(var i = 0; i < a.length; i++) {
        var e = a[i].split("\t");
        var id = e[0];
        var date = e[1];
        var title = e[2];
        t.push('<section class="fold" id="' + html(id) + '">');
        t.push('<h3>' + html(title) + '</h3>\r\n');
        t.push('<div class="entry" id="' + html(id) + '-entry"></div>\r\n');
        t.push('<div class="date">' + html(date) + '</div>\r\n');
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


    var id = hash.replace(/^#/, "");
    if(id && /^[0-9a-f]{32}$/i.test(id)) {
        var e = document.getElementById(id);
        if(e) {
            e.scrollIntoView();
            if(e.className == "fold") {
                unfold(id);
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
        location.hash = id;
    });

}
//----------------------------------------------------------------------------------------------------
function show(path) {

    var url = path + ".txt";

    fetch(url).then(function(t, options) {
        page(document.getElementById("content"), t.split(/\r\n|[\r\n]/), path);
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