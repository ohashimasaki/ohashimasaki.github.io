(function() {

    fetch("Pages.txt", function(t) {
        list(document.getElementById("pages"), t.split(/\r\n|[\r\n]/), "Pages");
    });

    fetch("Tags.txt", function(t) {
        list(document.getElementById("tags"), t.split(/\r\n|[\r\n]/), "Tags");
    });


//----------------------------------------------------------------------------------------------------
function list(u, a, h) {

    var t = [];

    t.push("<h3>" + h + "</h3>");
    t.push("<ul>");
    for(var i = 0; i < a.length; i++) {
        var e = a[i];
        v = e.split("/").pop().split(".")[0];
        t.push('<li ref="' + e + '">' + v + '</li>\r\n');
    }
    t.push("</ul>");

    u.innerHTML = t.join("\r\n");

    var e = u.getElementsByTagName("li");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            show(this.getAttribute("ref"));
        }, false);
    }

    e[0].click();

}
//----------------------------------------------------------------------------------------------------
function page(u, a) {

    var t = [];

    t.push("<h2>" + "" + "</h2>");

    for(var i = 0; i < a.length; i++) {
        var e = a[i].split("\t");
        var id = e[0];
        var date = e[1];
        var title = e[2];
        t.push('<section class="fold" ref="' + id + '">');
        t.push('<h3>' + title + '</h3>\r\n');
        t.push('<div class="entry" id="' + id + '"></div>\r\n');
        t.push('<div class="date">' + date + '</div>\r\n');
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
                unfold(this.getAttribute("ref"));
                this.className = "";
            }
        }, false);
    }

    var e = u.getElementsByClassName("top");
    for(var i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function() {
            document.documentElement.scrollTop = 0;
        }, false);
    }

}
//----------------------------------------------------------------------------------------------------
function unfold(id) {

    var url = "Sections/" + id.substr(0, 2) + "/" + id.substr(2) + ".txt";
    var e = document.getElementById(id);

    fetch(url, function(t) {
        e.innerHTML = t.replace(/\r\n/g, "<br />");
    });

}
//----------------------------------------------------------------------------------------------------
function show(ref) {

    fetch(ref, function(t) {
        page(document.getElementById("content"), t.split(/\r\n|[\r\n]/));
    });

}
//----------------------------------------------------------------------------------------------------
function fetch(url, callback) {

    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    if(typeof callback == "function") {
        request.onreadystatechange = function() {
            if(request.readyState == 4 && request.status == 200) {
                callback(trim(request.responseText));
            }
        };
    }

    request.send();
    return request.responseText;

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