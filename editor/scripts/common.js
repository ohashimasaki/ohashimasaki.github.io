    //----------------------------------------------------------------------------------------------------
    function onResize(_editor) {

        var bt = _editor.getElementsByClassName("remove-image");
        for(var i = 0; i < bt.length; i++) {
            var img = bt[i].previousElementSibling;
            bt[i].style.left = (img.offsetWidth - 20) + "px";
        }

    }
    //----------------------------------------------------------------------------------------------------
    function fetch(url, callback, parse, fallback) {

        var fso = new ActiveXObject("Scripting.FileSystemObject");
        if( ! fso.fileExists(url)) {
            return null;
        }

        var t = read(url);

        var data = JSON.parse(t);
        if(data) {
            return data;
        }

        return null;

    }
    //----------------------------------------------------------------------------------------------------
    function openFileDialog() {

        var file = document.getElementById("file-dialog");
        file.click();

        var path = trim(file.value);
        return path;    

    }
    //----------------------------------------------------------------------------------------------------
    function write(path, t) {

        var stream = new ActiveXObject("ADODB.Stream");
        stream.Type = 2;
        stream.Charset = "UTF-8";
        stream.Open();
        stream.WriteText(t, 1);
        stream.SaveToFile(path, 2);
        stream.Close();

    }
    //----------------------------------------------------------------------------------------------------
    function read(path) {

        var stream = new ActiveXObject("ADODB.Stream");
        stream.Type = 2;
        stream.Charset = "UTF-8";
        stream.Open();
        stream.LoadFromFile(path);
        var t = stream.ReadText();
        stream.Close();
        return t;

    }
    //----------------------------------------------------------------------------------------------------
    function hide(e) {

        if(e) {
            e.style.display = "none";
        }

    }
    //----------------------------------------------------------------------------------------------------
    function show(e) {

        if(e) {
            e.style.display = "block";
        }

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
    function getUserLocale() {

        var locale = (navigator.language || navigator.userLanguage).split(",")[0];

        return {
            language: locale.split("-")[0],
            territory: locale.split("-")[1]
        };

    }
    //----------------------------------------------------------------------------------------------------
    function toArray(q) {

        var a = [];
        for(var i = 0; i < q.length; i++) {
            a.push(q[i]);
        }
        return a;

    }
    //----------------------------------------------------------------------------------------------------
    function getGuid() {

        var typelib = new ActiveXObject("Scriptlet.TypeLib");
        return typelib.Guid.substr(1, 36).replace(/\-/g, "").toLowerCase();

    }
    //----------------------------------------------------------------------------------------------------
    function trim(t) {

        if(t == null) {
            return "(null)";
        }
        if(typeof t == "undefined") {
            return "(undefined)";
        }
        if(typeof t == "boolean") {
            return t === true ? "true" : "false";
        }
        if(typeof t != "string" && "toString" in t) {
            return "(" + t.toString() + ")";
        }

        return t.replace(/^\s+|\s+$/g, "");

    }
    //----------------------------------------------------------------------------------------------------
    function showStatusbar(t) {

        var _statusbar = document.getElementById("statusbar");
        _statusbar.style.display = "block";
        _statusbar.innerText = t;

        setTimeout(function() {
            document.getElementById("statusbar").style.display = "none";
        }, 1000);

    }
    //----------------------------------------------------------------------------------------------------
    function setPlaceholder(e, t) {

        while(e.firstElementChild) {
            e = e.firstElementChild;
        }

        e.innerText = t;

    }
    //----------------------------------------------------------------------------------------------------
    function getPlaceholder(text, name, subname) {

        if(name == "title") {
            return text.EnterTitle;
        } else if(name == "paragraph") {
            return text.EnterParagraph;
        } else if(name == "note") {
            return text.EnterNote;
        } else if(name == "quote") {
            return text.EnterQuote;
        } else if(name == "preformatted") {
            return text.EnterPreformattedText;
        } else if(name == "list") {
            return text.EnterList;
        } else if(name == "image" && subname == "caption") {
            return text.EnterImageCaption;
        } else if(name == "table" && subname == "figure") {
            return text.EnterTSV;
        } else if(name == "table" && subname == "caption") {
            return text.EnterTableCaption;
        }

        return text.EnterParagraph;

    }
    //----------------------------------------------------------------------------------------------------
    function escape(t) {

        if(t == null) {
            return "null";
        }
 
        if(typeof t == "boolean") {
            return t === true ? "true" : "false";
        }

        if(typeof t != "string") {
            return "";
        }

        t = t.replace(/\&/g, "&amp;");
        t = t.replace(/\</g, "&lt;");
        t = t.replace(/\>/g, "&gt;");
        t = t.replace(/\"/g, "&quot;");
        t = t.replace(/\'/g, "&apos;");

        return t 

    }
    //----------------------------------------------------------------------------------------------------















