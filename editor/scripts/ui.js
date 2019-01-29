function UI(_editor, $xml, $text) {

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
            equip(q[i]);
        }
    };



    //----------------------------------------------------------------------------------------------------
    function equip(e) {

        if(e.className != "title") {
            attachMenu(e);
        }

        if(e.className == "list") {
            //ui.List.equip(e);
        } else if(e.className == "image") {
            Figure.equip(e);
        } else {
            Paragraph.equip(e);
        }

        return e;

    }
    //----------------------------------------------------------------------------------------------------
    function attachMenu(section) {

        var id = section.getAttribute("id");

        var section_menu = SectionMenu(section);
        if( ! section.getElementsByClassName("section-menu")[0]) {
            section.appendChild(section_menu);
        }

        var insertion_menu = InsertionMenu(section);
        if( ! section.getElementsByClassName("insertion-menu")[0]) {
            section.appendChild(insertion_menu);
        }

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
            if(this.contains(event.toElement)) {
                return;
            }
            hide(section_menu);
            if(insertion_menu.hover) {
                return;
            }
            hide(insertion_menu);
            this.hover = null;
            insertion_menu.hover = null;
        };

    }
    //----------------------------------------------------------------------------------------------------
    var Paragraph = {

        new: function(type) {
            var node = null;
            var id = getGuid();
            var section = parseHTML([
                '<section class="' +  type + '" id="' + id + '" tabindex="-1">',
                    '<div class="view" tabindex="0" empty="true">' + markup(type, getPlaceholder($text, type)) + '</div>',
                    '<textarea class="write"></textarea>',
                '</section>'
            ].join("\r\n"));
            section = this.equip(section);
            var node = parseXML(markup(type));
            node.setAttribute("id", id);
            return {
                html: section,
                xml: node
            };
        },
        equip: function(section) {
            var type = section.className;
            var viewer = section.getElementsByClassName("view")[0];
            var writer = section.getElementsByClassName("write")[0];
            writer.style.display = "none";
            viewer.onmousedown = function() {
                activate(this);
                textbox.stretch(writer);
                focus(writer);
            };
            viewer.onfocus = function() {
                scroll(this.parentNode);
                activate(this);
                textbox.stretch(writer);
                focus(writer);
            };
            writer.onblur = function() {
                deactivate(this);
            };
            writer.onchange = function() {
                _changed = true;
                var v = hypertext(getValue(this, type), type);
                var t = markup(type, v);
                var c = parseXML(t);
                var e = $xml.selectSingleNode("/*/*[@id='" + section.getAttribute("id") + "']");
                if(c && e) {
                    e.parentNode.replaceChild(c, e);
                }
                viewer.innerHTML = t;
                deactivate(this);
                if( ! v) {
                    viewer.setAttribute("empty", "true");
                    setPlaceholder(viewer, getPlaceholder($text, type));
                } else {
                    viewer.removeAttribute("empty");
                }
            };

            attachMenu(section);

            return section;
        }

    };
    //----------------------------------------------------------------------------------------------------
    var Figure = {

        new: function() {
            var node = null;
            var id = getGuid();
            var section = parseHTML([
                '<section class="image" id="' + id + '" tabindex="-1">',
                    '<div class="figure" tabindex="-1">',
                        '<img src="" tabindex="0" />',
                        '<button type="button" class="remove-image" tabindex="0"></button>',
                    '</div>',
                    '<div class="caption" tabindex="-1">',
                        '<div class="view" tabindex="0" empty="true">',
                            '<figcaption>' + $text.EnterImageCaption + '</figcaption>',
                        '</div>',
                        '<textarea class="write"></textarea>',
                    '</div>',
                '</section>'
            ].join("\r\n"));
            section = this.equip(section);
            var node = parseXML([
                '<figure>',
                    '<img src="" />',
                    '<figcaption></figcaption>',
                '</figure>'
            ].join("\r\n"));
            var node = parseXML(markup("image"));
            node.setAttribute("id", id);
            return {
                html: section,
                xml: node
            };
        },
        equip: function(section) {
            var id = section.getAttribute("id");

            var caption = section.getElementsByClassName("caption")[0];
            var viewer = caption.getElementsByClassName("view")[0];
            var writer = caption.getElementsByClassName("write")[0];
            writer.style.display = "none";
            viewer.onmousedown = function() {
                activate(this);
                textbox.stretch(writer);
                focus(writer);
            };
            viewer.onfocus = function() {
                scroll(this.parentNode);
                activate(this);
                textbox.stretch(writer);
                focus(writer);
            };
            writer.onblur = function() {
                deactivate(this);
            };
            writer.onchange = function() {
                _changed = true;
                var v = hypertext(getValue(this));
                var c = parseXML([
                    '<figure>',
                        '<img src="" />',
                        '<figcaption>' + v + '</figcaption>',
                    '</figure>'
                ].join("\r\n"));
                var e = $xml.selectSingleNode("/*/*[@id='" + section.getAttribute("id") + "']");
                if(c && e) {
                    e.parentNode.replaceChild(c, e);
                }
                viewer.innerHTML = '<figcaption>' + v + '</figcaption>';
                deactivate(this);
                if( ! v) {
                    viewer.setAttribute("empty", "true");
                    setPlaceholder(viewer, getPlaceholder($text, type, "caption"));
                } else {
                    viewer.removeAttribute("empty");
                }
            };

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

            attachMenu(section);

            return section;
        }

    };
    //----------------------------------------------------------------------------------------------------
    function hypertext(t, type) {

        if(/^(?:preformatted|markup)$/.test(type)) {
            return t;
        }

        t = t.replace(/\r\n|[\r\n]/g, "<br />\r\n");
        t = t.replace(/(^|\s)((?:https?|\.\.?\/)[^\s"<>\[\]\{\}]+)(?:\[([^\[\]]+)\])?/g, function(m, s1, s2, s3) {
            return s1 + '<a href="' + s2 + '" target="_blank" rel="noopener">' + (s3 || s2) + '</a>';
        });

        return t;

    }
    //----------------------------------------------------------------------------------------------------
    function add(id, o) {

        var e = document.getElementById(id); // section

        if( ! e) {
            notice($text.ItemInsertFailed);
            return;
        }

        if(e.nextElementSibling) {
            e.parentNode.insertBefore(o.html, e.nextElementSibling);
        } else {
            e.parentNode.appendChild(o.html);
        }

        var n = $xml.selectSingleNode("/*/*[@id='" + id + "']");
        if(n) {
            var s = n.nextSibling;
            if(s) {
                n.parentNode.insertBefore($xml.createTextNode("\r\n\t"), s);
                n.parentNode.insertBefore(o.xml, s);
                n.parentNode.insertBefore($xml.createTextNode("\r\n\t"), s);
            } else {
                n.parentNode.appendChild($xml.createTextNode("\r\n\t"));
                n.parentNode.appendChild(o.xml);
                $xml.documentElement.appendChild($xml.createTextNode("\r\n"));
            }
        } else {
            $xml.documentElement.appendChild($xml.createTextNode("\r\n\t"));
            $xml.documentElement.appendChild(o.xml);
            $xml.documentElement.appendChild($xml.createTextNode("\r\n"));
        }


    }
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
        $xml.selectSingleNode("/*/figure[@id='" + id + "']/img").setAttribute("src", src);
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

        $xml.selectSingleNode("/*/figure[@id='" + id + "']/img").setAttribute("src", "");

    }
    //----------------------------------------------------------------------------------------------------
    function markup(type, value) {

        if(type == "note") {
            return '<aside>' + (value || "") + '</aside>';
        } else if(type == "quote") {
            return '<blockquote>' + (value || "") + '</blockquote>';
        } else if(type == "preformatted") {
            return '<pre>' + (value || "") + '</pre>';
        } else if(type == "markup") {
            return '<div>' + (value || "") + '</div>';
        } else if(type == "title") {
            return '<h1>' + (value || "") + '</h1>';
        } else if(type == "header") {
            return '<h2>' + (value || "") + '</h2>';
        } else {
            return '<p>' + (value || "") + '</p>';
        }

    }
    //----------------------------------------------------------------------------------------------------
    function getValue(e, type) {

        if(type == "markup") {
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
    function remove(id) {

        var e = document.getElementById(id); // section
        if(e) {
            e.parentNode.removeChild(e);
        }

        e = $xml.selectSingleNode("/*/*[@id='" + id + "']");
        if(e) {
            e.parentNode.removeChild(e);
        }

    }
    //----------------------------------------------------------------------------------------------------
    function moveup(id) {

        var e = document.getElementById(id); // section
        if(e) {
            var s = e.previousElementSibling;
            if(s) {
                var c = equip(e.cloneNode(true));
                s.parentNode.insertBefore(c, s);
                e.parentNode.removeChild(e);
            }
        }

        var e = $xml.selectSingleNode("/*/*[@id='" + id + "']");
        if(e) {
            var s = $xml.selectSingleNode("/*/*[@id='" + e.getAttribute("id") + "']/preceding-sibling::*[1]");
            if(s) {
                var c = e.cloneNode(true);
                s.parentNode.insertBefore(c, s);
                e.parentNode.removeChild(e);
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function movedown(id) {

        var e = document.getElementById(id); // section
        if(e) {
            var s = e.nextElementSibling ? e.nextElementSibling.nextElementSibling : e.nextElementSibling;
            var c = equip(e.cloneNode(true));
            if( ! s) {
                e.parentNode.appendChild(c);
            } else {
                s.parentNode.insertBefore(c, s);
            }
            e.parentNode.removeChild(e);
        }


        var e = $xml.selectSingleNode("/*/*[@id='" + id + "']");
        if(e) {
            var s = $xml.selectSingleNode("/*/*[@id='" + e.getAttribute("id") + "']/following-sibling::*[2]");
            var c = e.cloneNode(true);
            if( ! s) {
                e.parentNode.appendChild(c);
            } else {
                s.parentNode.insertBefore(c, s);
            }
            e.parentNode.removeChild(e);
        }

    }
    //----------------------------------------------------------------------------------------------------
    function SectionMenu(section) {

        var menu = section.getElementsByClassName("section-menu")[0];

        if( ! menu) {
            menu = parseHTML([
                '<ul class="section-menu" for="' + section.getAttribute("id") + '">',
                    '<li class="delete"> </li>',
                    '<li class="up"> </li>',
                    '<li class="down"> </li>',
                    '<li class="insert"> </li>',
                '</ul>'
            ].join("\r\n"));
        }

        menu.onclick = function() {
            var a = event.srcElement.className;
            var id = this.getAttribute("for");
            if(a == "delete") {
                remove(id);
            } else if(a == "up") {
                moveup(id);
            } else if(a == "down") {
                movedown(id);
            } else if(a == "insert") {
                var m = document.getElementById(id).getElementsByClassName("insertion-menu")[0];
                m.style.top = (this.offsetTop + 30) + "px";
                m.style.right = 10 + "px";
                show(m);
            }
        };

        return menu;

    }
    //----------------------------------------------------------------------------------------------------
    function InsertionMenu(section) {

        var menu = section.getElementsByClassName("insertion-menu")[0];

        if( ! menu) {
            menu = parseHTML([
                '<ul class="insertion-menu" for="' + section.getAttribute("id") + '">',
                    '<li class="insert-header">' + $text.Header + '</li>',
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
        }

        menu.onclick = function() {
            var type = trim(event.srcElement.className.split("insert-")[1]);
            var id = this.getAttribute("for");
            if(type == "list") {
//                ui.List.insert(section);
            } else if(type == "image") {
                add(id, Figure.new());
            } else if(type == "table") {
//                ui.Table.insert(section);
            } else {
                add(id, Paragraph.new(type));
            }
            hide(this);
        };

        menu.onmouseover = function() {
            if(this.hover) {
                clearTimeout(this.hover);
                this.hover = null;
            };
        }

        menu.onmouseout = function() {
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

        return menu;

    }
    //----------------------------------------------------------------------------------------------------
    function parseHTML(t) {

        var p = document.createElement("div");
       p.innerHTML = t;

        var e = p.childNodes;
        for(var i = 0; i < e.length; i++) {
            if(e[i].nodeType == 1) {
                return e[i].cloneNode(true);
            }
        }

        p = null;
        return null;

    }
    //----------------------------------------------------------------------------------------------------
    function parseXML(t) {

        var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
        xml.loadXML(t);
        return xml.documentElement.cloneNode(true);

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






























