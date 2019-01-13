﻿function UI(_editor, xml, $text) {

    var ui = {};

    var textbox = new Textbox();

    ui.elasticateAll = function(e, test) {
        var q = e.getElementsByTagName("textarea");
        for(var i = 0; i < q.length; i++) {
            show(q[i]);
        }
        textbox.adjust(toArray(q), test);

        var q = e.getElementsByTagName("textarea");
        for(var i = 0; i < q.length; i++) {
            textbox.elasticate(q[i], test);
            if(q[i].className == "write") {
                hide(q[i]);
            }
        }
    };

    ui.equipAll = function(e) {
        var q = e.querySelectorAll("section");
        for(var i = 0; i < q.length; i++) {
            ui.equip(q[i]);
        }
    };


    ui.equip = function(section) {
        if( ! section) {
            return false;
        }

        if(section.className != "title") {
            ui.Menu.insert(section);
        }

        if(section.className == "list") {
            return ui.List.equip(section);
        } else {
            return ui.Paragraph.equip(section);
        }

        return false;    
    };



    ui.Paragraph = {
        equip: function(section) {
            try {
                var id = section.getAttribute("id");
                var name = section.className;

                var isFigure = (name == "image" || name == "table");
                var caption = isFigure ? section.getElementsByClassName("caption")[0] : null;
                var viewer = (caption || section).getElementsByClassName("view")[0];
                var writer = (caption || section).getElementsByClassName("write")[0];

                viewer.onmousedown = function() {
                    var writer = activate(this);
                    textbox.stretch(writer);
                    focus(writer);
                };
                viewer.onfocus = function() {
                    scroll(this.parentNode);
                    var writer = activate(this);
                    textbox.stretch(writer);
                   focus(writer);
                };


                writer.onblur = function() {
                    deactivate(this);
                };

                writer.addEventListener("change", function() {
                    _changed = true;
                    if(name == "title") {
                        $titlechanged = true;
                    }
                    var v = getValue(this, name);
                    var blank = ! v;
                    var t = createParagraph(this, v, id);

                    replaceParagraph(id, t);
                    var viewer = deactivate(this);
                    viewer.innerHTML = t;
                    if(blank) {
                        viewer.setAttribute("empty", "true");
                        if(name == "image" || name == "table") {
                            setPlaceholder(viewer, getPlaceholder($text, name, "caption"));
                        } else {
                            setPlaceholder(viewer, getPlaceholder($text, name));
                        }
                    } else {
                        viewer.removeAttribute("empty");
                    }
                }, false);

                if(name == "image") {
                    ui.Image.equip(section);
                }
                if(name == "table") {
                    ui.Table.equip(section);
                }

                return true;

            } catch(ex) {
                return false;
            }
        },


        insert: function(section, type) {
            _changed = true;
            var id = getGuid();
            var t = "";
            if(type == "paragraph") {
                t = '<p>' + $text.EnterParagraph + '</p>';
            } else if(type == "note") {
                t = '<aside>' + $text.EnterNote + '</aside>';
            } else if(type == "quote") {
                t = '<blockquote>' + $text.EnterQuote + '</blockquote>';
            } else if(type == "preformatted") {
                t = '<pre>' + $text.EnterPreformattedText + '</pre>';
            } else if(type == "markup") {
                t = '<div>' + $text.EnterMarkup + '</div>';
            } else {
                return;
            }

            var c = toNode(t);
            c.setAttribute("id", id); 
            if( ! insertXmlNode(c, section.getAttribute("id"))) {
                notice($text.ItemInsertFailed);
            }

            section.insertAdjacentHTML("afterend", "\r\n" + [
                '<section class="' +  type + '" id="' + id + '" tabindex="-1">',
                    '<div class="view" tabindex="0" empty="true">' + t + '</div>',
                    '<textarea class="write"></textarea>',
                '</section>'
            ].join("\r\n"));

            var e = document.getElementById(id);
            ui.elasticateAll(e); 

            if(ui.equip(e)) {
                var w = e.document.getElementsByTagName("textare");
                for(var i = 0; i < w.length; i++) {
                    w[i].style.display = "block";
                    textbox.elasticate(w[i]);
                    w[i].style.display = "none";
                }
                flash(e);
                notice($text.ItemInserted);
            } else {
                notice($text.ItemInsertFailed);
            }
        }


    };
    //----------------------------------------------------------------------------------------------------
    function getValue(e, name) {

        if(name == "markup") {
            var v = trim(e.value);
            var xml = new ActiveXObject("MSXML2.DOMDocument");
            if( ! xml.loadXML(v)) {
                alert($text.EnterWellFormedXML);
                return "";
            }
            return v;
        }
 
        var v = escape(e.value);

        if(/\r\n$/.test(v)) {
            v = v + "\r\n";
        } else if(v && /\n$/.test(v)) {
            v = v + "\n";
        }

        v = v.replace(/^(?:\r\n|\s)$/, "");

        return v;

    }
    //----------------------------------------------------------------------------------------------------
    function createParagraph(e, v, id) {

        var name = document.getElementById(id).className;

        if(name != "preformatted" && name != "markup") {
            v = v.replace(/\r\n|[\r\n]/g, "<br />\r\n");
            v = v.replace(/(?:^|\s)((?:https?|\.\.?\/)[^\s"<>\[\]\{\}]+)(?:\[([^\[\]]+)\])?/g, function(m, s1, s2) {
                return '<a href="' + s1 + '" target="_blank" rel="noopener">' + (s2 || s1) + '</a>';
            });
        }

        if(name == "title") {
            return '<h1>' + v + '</h1>';
        } else if(name == "paragraph") {
            return '<p>' + v + '</p>';
        } else if(name == "note") {
            return '<aside>' + v + '</aside>';
        } else if(name == "quote") {
            return '<blockquote>' + v + '</blockquote>';
        } else if(name == "preformatted") {
            return '<pre>' + v + '</pre>';
        } else if(name == "markup") {
            return '<div>' + v + '</div>';
        } else if(name == "image" || name == "table") {
            return '<figcaption>' + v + '</figcaption>';
        }
    }
    //----------------------------------------------------------------------------------------------------
    function replaceParagraph(id, t) {

        var c = toNode(t);
        var n = xml.selectSingleNode("/*/*[@id='" + id + "']");
        if( ! c || ! n) {
            return;
        }
        if(n.nodeName == "figure") {
            n.replaceChild(c, n.selectSingleNode("figcaption"));
        } else {
            c.setAttribute("id", id);
            n.parentNode.insertBefore(xml.createTextNode("\r\n\t\t"), n);
            n.parentNode.insertBefore(c, n);
            n.parentNode.insertBefore(xml.createTextNode("\r\n\t"), n);
            n.parentNode.removeChild(n);
        }
    }
    //----------------------------------------------------------------------------------------------------
    ui.Image = {

        equip: function(section) {
            try {
                var id = section.getAttribute("id");
                var img = section.getElementsByTagName("img")[0];

                img.onmousedown = function() {
                    replaceImage(this, id);
                    _changed = true;
                };
                img.onkeydown = function() {
                    if(event.keyCode == 13) {
                        replaceImage(this, id);
                        _changed = true;
                    }
                };
                img.onfocus = function() {
                    scroll(this.parentNode);
                };
                img.onload = function() {
                    onResize(_editor);
                };
                img.onerror = function() {
                    this.className = "noimage";
                };

                var bt = section.getElementsByClassName("remove-image")[0];
                bt.onclick = function() {
                    if( ! confirm($text.RemoveImage)) {
                        return;
                    }
                    var img = this.parentNode.getElementsByTagName("img")[0];
                    removeImage(img, id);
                    _changed = true;
                };
                bt.onkeydown = function() {
                    if(event.keyCode == 13) {
                        if( ! confirm($text.RemoveImage)) {
                            return;
                        }
                        var img = this.parentNode.getElementsByTagName("img")[0];
                        removeImage(img, id);
                        event.returnValue = false;
                        _changed = true;
                    }
                };
                bt.onfocus = function() {
                    scroll(this.parentNode);
                };

                return true;

            } catch(ex) {
                return false;
            }
        },

        insert: function(section) {
            _changed = true;
            var id = getGuid();
            var c = toNode([
                '<figure id="' + id + '">',
                    '<img src="" />',
                    '<figcaption></figcaption>',
                '</figure>'
            ].join("\r\n"));
            if( ! insertXmlNode(c, section.getAttribute("id"))) {
                notice($text.ItemInsertFailed);
            }
            section.insertAdjacentHTML("afterend", "\r\n" + [
                '<section class="image" id="' + id + '" tabindex="-1">',
                    '<div class="figure" tabindex="-1">',
                        '<img src="" tabindex="0" />',
                        '<button type="button" class="remove-image" tabindex="0"></button>',
                    '</div>',
                    '<div class="caption" tabindex="-1">',
                        '<div class="view" tabindex="0" empty="true"><figcaption>' + $text.EnterImageCaption + '</figcaption></div>',
                        '<textarea class="write"></textarea>',
                    '</div>',
                '</section>'
            ].join("\r\n"));

            var e = document.getElementById(id);
            ui.elasticateAll(e);
            if(ui.equip(e)) {
                flash(e);
                notice($text.ItemInserted);
            } else {
                notice($text.ItemInsertFailed);
            }
        }


    };
    //----------------------------------------------------------------------------------------------------
    function replaceImage(img, id) {

        var path = openFileDialog();

        if( ! path) {
            return;
        }

        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var ext = "." + fso.getExtensionName(path).toLowerCase();
        if( ! /\.(?:png|jpe?g|bmp|gif)$/i.test(ext)) {
            return;
        }

        // DELETE OLD IMAGE
        removeImage(img, id);

        var src = "images/" + getUniqueName(10) + ext;
        fso.copyFile(path, src, true);
        fso = null;
        xml.selectSingleNode("/*/figure[@id='" + id + "']/img").setAttribute("src", src);
        fetchImage(img, src, 20);

    }
    //----------------------------------------------------------------------------------------------------
    function getUniqueName(n) {

        var c = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var t = "";

        for(var i = 0; i < n; i++) {
            t += c.substr(Math.floor(Math.random() * c.length), 1);
        }

        return t;

    }
    //----------------------------------------------------------------------------------------------------
    function fetchImage(img, src, n) {

        if(n <= 0) {
            return;
        }

        var fso = new ActiveXObject("Scripting.FileSystemObject");
        if(fso.fileExists(src)) {
            setTimeout(function() {
                img.src = src;
                img.className = "";
            }, 100);
        } else if(n > 0) {
            setTimeout(function() {
                fetchImage(img, src, n - 1);
            }, 100);
        }

    }
    //----------------------------------------------------------------------------------------------------
    function removeImage(img, id) {

        var src = img.getAttribute("src");
        img.setAttribute("src", "");

        var fso = new ActiveXObject("Scripting.FileSystemObject");
        if(fso.fileExists(src)) {
            fso.deleteFile(src);
        }

        xml.selectSingleNode("/*/figure[@id='" + id + "']/img").setAttribute("src", "");

    }
    //----------------------------------------------------------------------------------------------------
    ui.Table = {

        equip: function(section) {
            try {
                var id = section.getAttribute("id");

                var figure = section.getElementsByClassName("figure")[0];
                var viewer = figure.getElementsByClassName("view")[0];
                var writer = figure.getElementsByClassName("write")[0];

                viewer.onmousedown = function() {
                    var writer = activate(this);
                    textbox.stretch(writer);
                    focus(writer);
                };
                viewer.onkeydown = function() {
                    if(event.keyCode == 13) {
                        var writer = activate(this);
                        textbox.stretch(writer);
                        focus(writer);
                        event.returnValue = false;
                    }
                };
                viewer.onfocus = function() {
                    scroll(this.parentNode);
                };
                writer.onblur = function() {
                    if(this.changed) {
                        return;
                    }
                    deactivate(this);
                };

                var callback = function() {
                    _changed = true;
                    event.cancelBubble = true;
                    var s = event.srcElement;
                    s.changed = true;
                    var v = trim(s.value);
                    var blank = ! v;
                    if(blank) {
                        var t = createTable(v);
                        replaceTable(id, t);
                        s.changed = false;
                        setTimeout(function() {
                            var viewer = deactivate(s);
                            viewer = replaceHtmlNode(viewer, t);
                            viewer.setAttribute("empty", "true");
                            setPlaceholder(viewer, $text.EnterTSV);
                            s.removeEventListener("change", callback, false);
                            ui.equip(section);
                        }, 0);
                    } else {
                        selectTableOrientation(s, function(e, o) {
                            var t = createTable(v, o);
                            replaceTable(id, t);
                            e.changed = false;
                            setTimeout(function() {
                                var viewer = deactivate(e);
                                viewer = replaceHtmlNode(viewer, t);
                                viewer.removeAttribute("empty"); 
                                e.removeEventListener("change", callback, false);
                                ui.equip(section);
                            }, 0);
                        });
                    }
                };

                writer.addEventListener("change", callback, false);
                return true;

            } catch(ex) {
                return false;
            }
        },

        insert: function(section) {
            _changed = true;
            var id = getGuid();

            var c = toNode([
                '<figure id="' + id + '">',
                    '<figcaption></figcaption>',
                    '<table></table>',
                '</figure>'
            ].join("\r\n"));

            if( ! insertXmlNode(c, section.getAttribute("id"))) {
                notice($text.ItemInsertFailed);
            }

            section.insertAdjacentHTML("afterend", "\r\n" + [
                '<section class="table" id="' + id + '" tabindex="-1">',
                    '<div class="figure" tabindex="-1">',
                        '<table class="view" tabindex="0" empty="true">',
                            '<tbody>',
                                '<tr><td>' + $text.EnterTSV + '</td></tr>',
                            '</tbody>',
                        '</table>',
                        '<textarea class="write"></textarea>',
                    '</div>',
                    '<div class="caption" tabindex="-1">',
                        '<div class="view" tabindex="0" empty="true"><figcaption>' + $text.EnterTableCaption + '</figcaption></div>',
                        '<textarea class="write"></textarea>',
                    '</div>',
                '</section>'
            ].join("\r\n"));

            var e = document.getElementById(id);
            ui.elasticateAll(e, true);

            if(ui.equip(e)) {
                flash(e);
                notice($text.ItemInserted);
            } else {
                notice($text.ItemInsertFailed);
            }
        }


    };
    //----------------------------------------------------------------------------------------------------
    function selectTableOrientation(e, callback) {

        if(typeof callback != "function") {
            return;
        }

        var ht = [
            '<ul id="table-orientation">',
                '<li id="orientation-none">' + $text.None + '</li>',
                '<li id="orientation-column">' + $text.Column + '</li>',
                '<li id="orientation-row">' + $text.Row + '</li>',
                '<li id="orientation-column-row">' + $text.ColumnRow + '</li>',
            '</ul>'
        ].join("\r\n");

        var popup = new Popup();
        popup.show($text.TableOrientation, ht);

        var q = document.getElementById("table-orientation").getElementsByTagName("li");
        for(var i = 0; i < q.length; i++) {
            q[i].onclick = function() {
                popup.hide();
                var o = this.getAttribute("id").split("-");
                o.shift();
                o = o.join("-");
                callback(e, o);
            };
        }

    }
    //----------------------------------------------------------------------------------------------------
    function createTable(v, o) {

        if( ! v) {
            return [
                '<table class="view" tabindex="0">',
                    '<tbody>',
                        '<tr><td></td></tr>',
                    '</tbody>',
                '</table>'
            ].join("\r\n");
        }

        d = v.replace(/\r\n|[\r\n]/g, "\r\n").split("\r\n");

        for(var i = 0; i < d.length; i++) {
            var r = trim(d[i]);
            if(r) {
                d[i] = r.split("\t");
            }
        }

        var c = 0;
        for(var i = 0; i < d.length; i++) {
            c = c >= d[i].length ? c : d[i].length;
        }
        if(c == 0) {
            return "";
        }

        var hasColumnHeader = /column/i.test(o);
        var hasRowHeader = /row/i.test(o);

        var t = [];
        var label = [];

        t.push('<table class="view" tabindex="0">');

        if(hasColumnHeader) {
            t.push('<thead>');
            t.push('<tr>');
            var cells = d.shift();
            for(var i = 0; i < c; i++) {
                var v = escape(trim(cells[i] || "")).replace(/:$/, "");
                label.push(v);
                t.push('<th>' + v + '</th>');
            }
            t.push('</tr>');
            t.push('</thead>');
        }
        t.push('<tbody>');

        for(var j = 0; j < d.length; j++) {
            t.push('<tr>');
            var cells = d[j];
            for(var i = 0; i < c; i++) {
                var v = escape(trim(cells[i] || "")).replace(/:$/, "");
                if(hasRowHeader && i == 0) {
                    t.push('<th label="' + label[i] + '">' + v + '</th>');
                } else {
                    t.push('<td label="' + label[i] + '">' + v + '</td>');
                }
            }
            t.push('</tr>');
        }
        t.push('</tbody>');
        t.push('</table>');

        t =  t.join("\r\n");

        return t;

    }
    //----------------------------------------------------------------------------------------------------
    function replaceTable(id, t) {

        var c = toNode(t);
        var n = xml.selectSingleNode("/*/figure[@id='" + id + "']");

        if( ! c || ! n) {
            return;
        }

        c.removeAttribute("class");
        c.removeAttribute("tabindex");
        c.setAttribute("id", id);
        var b = n.selectSingleNode("table");
        b.parentNode.removeChild(b);
        n.appendChild(xml.createTextNode("\r\n\t\t"));
        n.appendChild(c);
        n.appendChild(xml.createTextNode("\r\n\t"));

    }
    //----------------------------------------------------------------------------------------------------
    ui.List = {

        equip: function(section) {
            try {
                var id = section.getAttribute("id");

                var viewer = section.getElementsByClassName("view")[0];
                var writer = section.getElementsByClassName("write")[0];

                viewer.onmousedown = function() {
                    var writer = activate(this);
                    textbox.stretch(writer);
                    focus(writer);
                };
                viewer.onfocus = function() {
                    scroll(this.parentNode);
                    var writer = activate(this);
                    textbox.stretch(writer);
                    focus(writer);
                };

                writer.onblur = function() {
                    deactivate(this);
                    show(viewer);
                    hide(writer);
                };

                var callback = function() {
                    _changed = true;
                    event.cancelBubble = true;
                    var s = event.srcElement;
                    var v = getValue(s);
                    var blank = ! v;
                    var t = createList(s, v, id);
                    replaceList(id, t);
                    var viewer = deactivate(s);
                    viewer = replaceHtmlNode(viewer, t);
                    if(blank) {
                        viewer.setAttribute("empty", "true");
                        setPlaceholder(viewer, $text.EnterList);
                    } else {
                        viewer.removeAttribute("empty");
                    }
                    s.removeEventListener("change", callback, false);
                    ui.equip(section);
                };

                writer.addEventListener("change", callback, false);
                return true;

            } catch(ex) {
                return false;
            }
        },

        insert: function(section) {
            _changed = true;
            var id = getGuid();

            var c = toNode([
                '<ul id="' + id + '"></ul>'
            ].join("\r\n"));

            c.setAttribute("id", id);
            if( ! insertXmlNode(c, section.getAttribute("id"))) {
                notice($text.ItemInsertFailed);
            }

            section.insertAdjacentHTML("afterend", "\r\n" + [
                '<section class="list" id="' + id + '" tabindex="-1">',
                    '<ul class="view" tabindex="0" empty="true">' + $text.EnterList + '</ul>',
                    '<textarea class="write"></textarea>',
                '</section>'
            ].join("\r\n"));

            var e = document.getElementById(id);
            ui.elasticateAll(e);

            if(ui.equip(e)) {
                flash(e);
                notice($text.ItemInserted);
            } else {
                notice($text.ItemInsertFailed);
            }
        }


    };
    //----------------------------------------------------------------------------------------------------
    function replaceList(id, t) {

        var c = toNode(t);
        var n = xml.selectSingleNode("/*/ul[@id='" + id + "']");

        if( ! c || ! n) {
            return;
        }

        c.removeAttribute("class");
        c.removeAttribute("tabindex");
        c.setAttribute("id", id);
        n.parentNode.insertBefore(xml.createTextNode("\r\n\t\t"), n);
        n.parentNode.insertBefore(c, n);
        n.parentNode.insertBefore(xml.createTextNode("\r\n\t"), n);
        n.parentNode.removeChild(n);  

    }
    //----------------------------------------------------------------------------------------------------
    function createList(e, v, id) {

        if( ! v) {
            return [
                '<ul class="view" tabindex="0">',
                '</ul>'
            ].join("\r\n");
        }

        var d = v.replace(/\r\n|[\r\n]/g, "\r\n").split("\r\n");

        var t = [];

        t.push('<ul class="view" tabindex="0">');
        for(var i = 0; i < d.length; i++) {
            var v = trim(d[i]);
            if(v) {
                t.push('<li>' + escape(v) + '</li>');
            }
        }
        t.push('</ul>');

        t = t.join("\r\n");
        return t;

    }
    //----------------------------------------------------------------------------------------------------
    ui.Menu = {

        insert: function(section) {
            var id = section.getAttribute("id");

            section.insertAdjacentHTML("beforeend", "\r\n" + [
                '<ul class="section-menu" for="' + id + '">',
                    '<li class="delete"> </li>',
                    '<li class="up"> </li>',
                    '<li class="down"> </li>',
                    '<li class="insert"> </li>',
                '</ul>',
                '<ul class="insert-menu">',
                    '<li class="insert-paragraph">' + $text.Paragraph + '</li>',
                    '<li class="insert-note">' + $text.Note + '</li>',
                    '<li class="insert-quote">' + $text.Quote + '</li>',
                    '<li class="insert-preformatted">' + $text.PreformattedText + '</li>',
                    '<li class="insert-markup">' + $text.Markup + '</li>',
                    '<li class="insert-list">' + $text.List + '</li>',
                    '<li class="insert-image">' + $text.Image + '</li>',
                    '<li class="insert-table">' + $text.Table + '</li>',
                '</ul>'
            ].join("\r\n"));

            var _sectionmenu = section.getElementsByClassName("section-menu")[0];
            _sectionmenu.onclick = function() {
                var a = event.srcElement.className;
                var id = this.getAttribute("for");
                var e = document.getElementById(id); // section
                var n = xml.selectSingleNode("/*/*[@id='" + id + "']");
                //this.style.display = "none";

                if(a == "delete") {
                    remove(e);
                    remove(n);
                } else if(a == "up") {
                    if(ui.equip(moveup(e))) {
                        moveup(n);
                    } 
                } else if(a == "down") {
                    if(ui.equip(movedown(e))) {
                        movedown(n);
                    }
                } else if(a == "insert") {
                    _insertMenu.style.top = (this.offsetTop + 30) + "px";
                    _insertMenu.style.right = 10 + "px";
                    show(_insertMenu);
                }
            };

            var _insertMenu = section.getElementsByClassName("insert-menu")[0];
            _insertMenu.onclick = function() {
                var type = trim(event.srcElement.className.split("insert-")[1]);
                if(/paragraph|note|quote|preformatted|markup/.test(type)) {
                    ui.Paragraph.insert(section, type);
                } else if(type == "list") {
                    ui.List.insert(section);
                } else if(type == "image") {
                    ui.Image.insert(section);
                } else if(type == "table") {
                    ui.Table.insert(section);
                }
                hide(this);
            };

            _insertMenu.onmouseover = function() {
                if(this.hover) {
                    clearTimeout(this.hover);
                    this.hover = null;
                };
            }

            _insertMenu.onmouseout = function() {
                if(this.contains(event.toElement)) {
                    return;
                }
                if(this.hover) {
                    clearTimeout(this.hover);
                    this.hover = null;
                };
                var e = this;
                this.hover = setTimeout(function() {
                    hide(e);
                    e.hover = null;
                    if( ! e.parentNode.hover) {
                        hide(e.parentNode.getElementsByClassName("section-menu")[0]);
                        e.parentNode.hover = null;
                    }
                }, 800);
            };

            section.onmouseover = function() {
                if(this.hover) {
                    clearTimeout(this.hover);
                    this.hover = null;
                };
                var e = this;
                this.hover = setTimeout(function() {
                    show(e.getElementsByClassName("section-menu")[0]);
                }, 400);
            };

            section.onmouseout = function() {
                if(this.hover) {
                    clearTimeout(this.hover);
                    this.hover = null;
                };
                if(section.contains(event.toElement)) {
                    return;
                }
                var e = this;
                var _sm = e.getElementsByClassName("section-menu")[0];
                var _im = e.getElementsByClassName("insert-menu")[0];
                if(_im.hover) {
                    return;
                }
                hide(_sm);
                hide(_im);
                e.hover = null;
                _im.hover = null;
            };
        }

    }
    //----------------------------------------------------------------------------------------------------
    function toNode(t) {

        var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
        xml.loadXML(t);
        return xml.documentElement.cloneNode(true);

    }
    //----------------------------------------------------------------------------------------------------
    function insertXmlNode(c, id) {

        var n = xml.selectSingleNode("/*/*[@id='" + id + "']");

        if( ! n) {
            return false;
        }

        var s = n.nextSibling;

        if( ! s ) {
            n.parentNode.appendChild(xml.createTextNode("\r\n\t"));
            n.parentNode.appendChild(c);
            xml.documentElement.appendChild(xml.createTextNode("\r\n"));
        } else {
            n.parentNode.insertBefore(xml.createTextNode("\r\n\t"), s);
            n.parentNode.insertBefore(c, s);
            n.parentNode.insertBefore(xml.createTextNode("\r\n\t"), s);
        }

        return true;

    }
    //----------------------------------------------------------------------------------------------------
    function replaceHtmlNode(e, ht) {

        e.insertAdjacentHTML("afterend", ht);
        var c = e.nextElementSibling;
        e.parentNode.removeChild(e);
        return c;

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
    function flash(e) {

        e.style.backgroundColor = "#fcfcfc";

        setTimeout(function() {
            e.style.backgroundColor = "";
        }, 500);

    }
    //----------------------------------------------------------------------------------------------------
    function moveup(e) {

        if( ! e) {
            return null;
        }

        if(e.xml === undefined) { // HTML
            var s = e.previousElementSibling;
        } else {
            var s = xml.selectSingleNode("/*/*[@id='" + e.getAttribute("id") + "']/preceding-sibling::*[1]");
        }

        if( ! s) {
            return null;
        }

        var c = e.cloneNode(true);
        s.parentNode.insertBefore(c, s);
        e.parentNode.removeChild(e);
        return c;

    }
    //----------------------------------------------------------------------------------------------------
    function movedown(e) {

        if( ! e) {
            return null;
        }

        if(e.xml === undefined) { // HTML
            var s = e.nextElementSibling;
            if( ! s) {
                return null;
            }
            s = s.nextElementSibling;
        } else { // XML
            var s = xml.selectSingleNode("/*/*[@id='" + e.getAttribute("id") + "']/following-sibling::*[2]");
        }

        var c = e.cloneNode(true);
        if( ! s) {
            e.parentNode.appendChild(c);
        } else {
            s.parentNode.insertBefore(c, s);
        }
        e.parentNode.removeChild(e);
        return c;

    }
    //----------------------------------------------------------------------------------------------------
    function remove(e) {

        if( ! e) {
            return null;
        }

        e.parentNode.removeChild(e);

    }
    //----------------------------------------------------------------------------------------------------
    function focus(e) {

        setTimeout(function() {
            e.focus();
        }, 0);

    }
    //----------------------------------------------------------------------------------------------------
    function activate(e) {

        var p = e.parentNode;
        var writer = p.getElementsByClassName("write")[0];
        var viewer = p.getElementsByClassName("view")[0];
        hide(viewer);
        show(writer);
        return writer;

    }
    //----------------------------------------------------------------------------------------------------
    function deactivate(e) {

        var p = e.parentNode;
        var writer = p.getElementsByClassName("write")[0];
        var viewer = p.getElementsByClassName("view")[0];
        hide(e.parentNode.getElementsByClassName("write")[0]);
        show(e.parentNode.getElementsByClassName("view")[0]);
        return viewer;

    }
    //----------------------------------------------------------------------------------------------------
    function scroll(e) {

        var y = e.offsetTop;
        var top = document.documentElement.scrollTop;
        if(top > (y - 30)) {
            window.scrollBy(0, -50);
        }

    }

    //----------------------------------------------------------------------------------------------------
    function notice(t) {

        showStatusbar(t);

    }
    //----------------------------------------------------------------------------------------------------

    return ui;

}





























