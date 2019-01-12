(function($window) {

    window.resizeTo(1200, 750);

    var WindowCaption = "Page Editor";
    var $locale = getUserLocale();
    var $text = Text[$locale.language];

    var fso = new ActiveXObject("Scripting.FileSystemObject");

    var _header = document.getElementsByTagName("header")[0];
    var _main = document.getElementsByTagName("main")[0];
    var _footer = document.getElementsByTagName("footer")[0];
    var _file = document.getElementById("file");
    var _back = document.getElementById("back");
    var _new = document.getElementById("new");
    var _save = document.getElementById("save");
    var _delete = document.getElementById("delete");

    var _editor = document.getElementById("content");
    var _files = document.getElementById("index");

    var $id;
    var $path;
    var $changed;
    var $titlechanged;


    setWindowCaption();

    var $xml = new ActiveXObject("MSXML2.DOMDocument.6.0");

    var hash = location.hash.replace(/^#/, "");
    if(/^[0-9a-f]{14}$/i.test(hash)) {
        $id = hash;
    }
    if($id) {
        showPage($id);
    }


    _back.disabled = true;

    _back.onclick = function() {
        hide(_files);
        showPage($id);
        setWindowCaption($id);
    };

    _file.onclick = function() {
        if($changed) {
            if( ! confirm($text.Discard)) {
                return;
            }
            $changed = false;
        }
        hide(_editor);
        this.disabled = true;
        _back.disabled = false;
        _new.disabled = false;
        _save.disabled = true;
        _delete.disabled = true;
        findFiles(_files);
        setWindowCaption();
    };

    _new.onclick = function() {
        if($changed) {
            if( ! confirm($text.Discard)) {
                return;
            }
            $changed = false;
        }
        hide(_files);
        showPage();
        _new.disabled = true;
        $changed = true;
    };

    _save.onclick = function() {
        save($path);
        updateIndex();
        updateCategory();
        showStatusbar($text.Saved + " " + $path);
        _new.disabled = false;
    };

    _delete.onclick = function() {
        deletePage($id);
        updateIndex();
        updateCategory();
    };


    document.ondrop = function() {
        event.returnValue = false;
    };

    document.addEventListener("keydown", function() {
        if(event.keyCode == 116) {
            var url = document.URL.split("#")[0] + "#" + $id;
            location.replace(url);
            //location.reload(true);
        }
    }, false);


    document.ondrop = function() {
        event.returnValue = false;
    };

    window.onbeforeunload = function() {
        if($changed) {
            if(confirm($text.Unsaved)) {
                save($path);
                event.returnValue = $text.Saved;
            }
        }
    };


    //----------------------------------------------------------------------------------------------------
    function setWindowCaption(id) {

        if( ! id) {
            document.title = WindowCaption;
        } else {
            document.title = id;
        }

    }
    //----------------------------------------------------------------------------------------------------
    function showPage(id) {

        hide(_files);
        show(_editor);

        _file.disabled = false;
        _back.disabled = true;
        _save.disabled = false;

        $changed = false;
        $titlechanged = false;

        var path = "";

        if(/^[0-9a-f]{14}$/i.test(id)) {
            var folder = id.substr(0, 4);
            path = "entries/" + folder + "/" + id + ".xml";
            _delete.disabled = false;
        }

        if( ! fso.fileExists(path)) {
            var dt = parseDate("");
            var id = dt.date.join("") + dt.time.join("");
            var folder = id.substr(0, 4);
            path = "entries/" + folder + "/" + id + ".xml";
            _delete.disabled = true;
        }

        $id = id;
        $path = path;

        setWindowCaption(id);

        if( ! path || ! $xml.load(path)) {
            $xml.loadXML([
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<article title="" published="" updated="" category="">',
                    '<h1></h1>',
                    '<p></p>',
                '</article>',
            ].join("\r\n"));
        }

        var items = $xml.selectNodes("/*/*");
        for(var i = 0; i < items.length; i++) {
            items[i].setAttribute("id", getGuid());
        }

        var xsl = new ActiveXObject("MSXML2.DOMDocument.6.0");
        xsl.load("editor/scripts/entry.xsl");

        var html = new ActiveXObject("MSXML2.DOMDocument.6.0");
        $xml.transformNodeToObject(xsl, html);
        _editor.innerHTML = html.xml;

        var ui = new UI(_editor, $xml, $text);
        ui.elasticateAll(_editor);
        ui.equipAll(_editor);

        setPlaceholders(_editor);

        window.addEventListener("resize", function() {
            onResize(_editor);
        }, false);

        onResize(_editor);

    }
    //----------------------------------------------------------------------------------------------------
    function setPlaceholders(e) {

        var q = e.getElementsByClassName("view");
        for(var i = 0; i < q.length; i++) {
            var e = q[i];
            if( ! e.innerText.replace(/[\s\t]/g, "")) {
                e.setAttribute("empty", "true");
                var p = e.parentNode;
                if(p.tagName.toLowerCase() == "section") {
                    setPlaceholder(e, getPlaceholder($text, p.className));
                } else if(p.className == "figure" || p.className == "caption") {
                    setPlaceholder(e, getPlaceholder($text, p.parentNode.className, p.className));
                }
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function save(path) {

        if( ! fso.folderExists("entries")) {
            fso.createFolder("entries");
        }

        var folder = fso.getBaseName(fso.getParentFolderName(path));

        if( ! fso.folderExists("entries/" + folder)) {
            fso.createFolder("entries/" + folder);
        }

        var doc = $xml.cloneNode(true);
        var items = doc.selectNodes("/*//*[@id]");
        for(var i = 0; i < items.length; i++) {
            items[i].removeAttribute("id");
        }

        var published = doc.documentElement.getAttribute("published");
        var date = parseDate("").iso8601;

        if( ! published) {
            doc.documentElement.setAttribute("published", date);
        }

        doc.documentElement.setAttribute("updated", date);
        var title = doc.selectSingleNode("/*/h1");
        doc.documentElement.setAttribute("title", title ? trim(title.text) : "");

        var c = trim(document.getElementById("category").value);
        c = c.replace(/\s*,\s*/g, ",").replace(/,+/g, ",").replace(/^,+|,+$/g, "");
        doc.documentElement.setAttribute("category", c);

        doc.save(path);

        _delete.disabled = false;
        $changed = false;
        $titlechanged = false;


    }
    //----------------------------------------------------------------------------------------------------
    function deletePage(id) {

        if(fso.fileExists($path)) {
            fso.deleteFile($path);
        }

        updateIndex(id);
        _editor.innerHTML = "";

        _save.disabled = true;
        _delete.disabled = true;
        setWindowCaption();

        $changed = false;
        $titlechanged = false;

        showStatusbar($text.Deleted);

    }
    //----------------------------------------------------------------------------------------------------
    function updateIndex() {

        var files = [];

        var folder = new Enumerator(fso.getFolder("entries").subfolders);
        for(; ! folder.atEnd(); folder.moveNext()) {
            var file = new Enumerator(fso.getFolder(folder.item().path).files);
            for(; ! file.atEnd(); file.moveNext()) {
                files.push(file.item().path);
            }
        }

        files.sort(function(f1, f2) {
            if(f1 < f2) {
                return 1;
            } else if(f1 > f2) {
                return -1;
            }
            return 0;
        });

        var entry = [];
        var xml = new ActiveXObject("MSXML2.DOMDocument");

        for(var i = 0; i < files.length; i++) {
            var path = files[i];
            xml.load(path);

            var id = fso.getBaseName(path);
            var file = fso.getFileName(path);
            var folder = fso.getBaseName(fso.getParentFolderName(path));
            var url = "entries/" + folder + "/" + file;
            var title = trim(xml.documentElement.getAttribute("title")) || "(untitled)";
            var published = xml.documentElement.getAttribute("published");
            var updated = xml.documentElement.getAttribute("updated");
            var summary = xml.documentElement.text.substr(0,50);

            entry.push({
                id: id,
                title: title,
                link: {
                    rel: "self",
                    href: url
                },
                published: published,
                updated: updated,
                summary: summary
            });
        }

        var dt = parseDate("");
        var id = dt.date.join("") + dt.time.join("");

        var feed = {
            id: id,
            title: id,
            updated: dt.iso8601,
            author: "ohashmasaki",
            rights: "Ohashi, Masaki",
            entry: entry
        }

        feed = JSON.stringify(feed);

        write("feed.json", feed);


    }
    //----------------------------------------------------------------------------------------------------
    function updateCategory() {

        var tags = {};

        var xml = new ActiveXObject("MSXML2.DOMDocument");

        var folder = new Enumerator(fso.getFolder("entries").subfolders);
        for(; ! folder.atEnd(); folder.moveNext()) {
            var file = new Enumerator(fso.getFolder(folder.item().path).files);
            for(; ! file.atEnd(); file.moveNext()) {
                xml.load(file.item().path);
                var id = fso.getBaseName(file.item().path);
                var category = trim(xml.documentElement.getAttribute("category"));
                if(category) {
                    category = category.split(",");
                    for(var i = 0; i < category.length; i++) {
                        var c = trim(category[i]);
                        if( ! tags[c]) {
                            tags[c] = [];
                        }
                        tags[c].push(id); 
                    }
                }
            }
        }

        var category = [];
        for(var c in tags) {
            tags[c].sort().reverse();
            category.push({
                name: c,
                entries: tags[c]
            });
        }

        category.sort(function(c1, c2) {
            if(parseInt(c1.entries.length) < parseInt(c2.entries.length)) {
                return 1;
            } else if(parseInt(c1.entries.length) > parseInt(c2.entries.length)) {
                return -1;
            }
            return 0;
        });

        category = JSON.stringify(category);

        write("category.json", category);


    }
    //----------------------------------------------------------------------------------------------------
    function findFiles(_files) {

        var folder = new Enumerator(fso.getFolder("entries").subfolders);

        var ht = [];
        ht.push('<div id="files">');
        for(; ! folder.atEnd(); folder.moveNext()) {
            var name = folder.item().name;
            var path = "entries/" + name;
            ht.push([
                '<h3><a for="' + name + '" path="' + path + '">' + name + '</a></h3>',
                '<ul id="files-by-month-' + name + '"></ul>'
            ].join("\r\n"));
        }
        ht.push('</div>');
        document.getElementById("index").innerHTML = ht.join("\r\n");
        show(_files);

        var e = _files.getElementsByTagName("h3");
        for(var i = 0; i < e.length; i++) {
            var a = e[i].getElementsByTagName("a")[0];
            a.onclick = function() {
                var id = this.getAttribute("for");
                var path = this.getAttribute("path");
                var u = document.getElementById("files-by-month-" + id);
                if( ! u.style.display) {
                    showFileIndex(path, u);
                    this.className = "unfolded";
                } else if(u.style.display == "none") {
                    show(u);
                    this.className = "unfolded";
                } else {
                    hide(u);
                    this.className = "folded";
                }
            };
        }

    }
    //----------------------------------------------------------------------------------------------------
    function showFileIndex(path, u) {

        var file = new Enumerator(fso.getFolder(path).files);
        var xml = new ActiveXObject("MSXML2.DOMDocument");

        var ht = [];
        for(; ! file.atEnd(); file.moveNext()) {
            var id = fso.getBaseName(file.item().path);
            xml.load(file.item().path);
            var title = xml.documentElement.getAttribute("title") || "(untitled)";
            ht.push([
                '<li>',
                    '<a id="' + id + '">',
                        '<span class="file-title">' + title + '</span>',
                        '<span class="file-date">' + id + '</span>',
                    '</a>',
                '</li>'
            ].join("\r\n"));
        }
        u.innerHTML = ht.join("\r\n");
        show(u);

        var e = u.getElementsByTagName("a");
        for(var i = 0; i < e.length; i++) {
            e[i].onclick = function() {
                var id = this.getAttribute("id");
                showStatusbar($text.Loading);
                setTimeout(function() {
                    showPage(id);
                }, 10);
            };
        }

    }
    //----------------------------------------------------------------------------------------------------


})(this);




























