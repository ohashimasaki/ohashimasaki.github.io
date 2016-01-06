function Touchproof() {

    var touchproof = {};
    var transition;
    var transitionAvailable = false;


    touchproof.attach = function(map, type) {
        if(Math.max(screen.width, screen.height) <= 800) {
            type = false;
        }
        if(typeof type == "string" && /^(?:cloud)$/i.test(type)) {
            transitionAvailable = true;
        }
        var cover = Cover(map, type);
        cover.on(0);
        return {
            wait: function() {
                cover.on(3000); 
            }
        };
    }


    function Cover(map, type) {
        var cover = {
            timeout: null,
            moving: false
        };
        var _cover = document.createElement("div");
        _cover.style.position = "absolute";
        _cover.style.zIndex = "3000000";
        _cover.style.overflow = "hidden";
        _cover.style.display = "block";

        if( ! transitionAvailable) {
            _cover.style.backgroundColor = "#000000";
            _cover.style.opacity = "0.05";
        }

        map.parentNode.appendChild(_cover);

        _cover.onmousedown = function() {
            cover.off();
        };
        _cover.onmouseup = function() {
            alert(cover.on(3000));
        };

        attachEvent(map, "mousedown", function() {
            clearTimeout(cover.timeout);
        });
        attachEvent(map, "mouseup", function() {
            cover.on(3000);
        });

        cover.ontouchstart = function(_event) {
            cover.moving = false;
            cover.time = (new Date).getTime();
        };
        cover.ontouchmove = function(_event) {
            if(_event.touches.length == 1) {
                cover.moving = true;
            } else if(_event.touches.length > 1) {
                if((new Date).getTime() - cover.time > 50) {
                    cover.moving = true;
                }
            }
        };
        cover.ontouchend = function(_event) {
            if(_event.touches.length > 0) {
                return;
            }
            if(cover.moving) {
                cover.moving = false;
                return;
            }
            cover.on(3000);
        };

        attachEvent(map, "touchstart", function(_event) {
            if(_event.touches.length > 1) {
                return;
            }
            clearTimeout(cover.timeout);
        });
        attachEvent(map, "touchend", function(_event) {
            if(_event.touches.length > 1) {
                return;
            }
            cover.on(3000);
        });

        try {
            attachEvent(map, "wheel", function(_event) {
                cover.on(3000);
            }, true);
        } catch(e) {}

        try {
            attachEvent(map, "mousewheel", function(_event) {
                cover.on(3000);
            }, true);
        } catch(e) {}

        cover.on = function(timeout) {
            clearTimeout(cover.timeout);
            cover.timeout = setTimeout(function() {
                _cover.style.display = "block";
                _cover.style.width = map.offsetWidth + "px";
                _cover.style.height = map.offsetHeight + "px";
                _cover.style.top = map.offsetTop + "px";
                _cover.style.left = map.offsetLeft + "px";
                if(transitionAvailable) {
                    transition = transition ? transition :Transition(_cover);
                    transition.start();
                }

            }, (timeout || 0));
            return cover.timeout;
        };

        cover.off = function() {
            clearTimeout(cover.timeout);
            _cover.style.display = "none";
            if(transition) {
                transition.stop();
            }
        }

        cover.resize = function() {
            _cover.style.width = map.offsetWidth + "px";
            _cover.style.height = map.offsetHeight + "px";
            _cover.style.top = map.offsetTop + "px";
            _cover.style.left = map.offsetLeft + "px";
            if(transition) {
                transition.resize();
            }
        };

        attachEvent(window, "resize", function() {
            if(_cover.style.display == "none") {
                return;
            }
            cover.resize();
        });

        return cover;
    }


    function attachEvent(e, type, fn, capture) {
        type = type.replace(/^on/i, "");
        if(e.attachEvent) {
            e.attachEvent("on" + type, fn);
        } else {
            e.addEventListener(type, fn, (capture || false));
        }
    }


    return touchproof;



    function Transition(_base) {
        var transition = {};
        var queue = {};
        var items = {}; 

        var base = [
            '<svg id="_touchproof-sky" xmlns="http://www.w3.org/2000/svg" ',
            ' width="' + _base.offsetWidth + '" height="' + _base.offsetHeight + '" ',
//            ' viewBox="' + [_base.offsetWidth, _base.offsetHeight].join(",") + '" ',
            '>',
                '<defs>',
                    '<filter id="_touchproof-shadow" filterUnits="userSpaceOnUse">',
                        '<feOffset in="SourceGraphic" dx="-15" dy="25" result="offset" />',
                        '<feColorMatrix in="offset" type="matrix" values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" result="matrix" />',
                        '<feGaussianBlur in="matrix" stdDeviation="10" result="blur" />',
                        '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="fuzzy" />',
                        '<feMerge>',
                            '<feMergeNode in="blur"/>',
                            '<feMergeNode in="fuzzy"/>',
                        '</feMerge>',
                    '</filter>',
                '</defs>',
            '</svg>'
        ].join("\r\n");

        _base.insertAdjacentHTML("beforeend", base);

        transition.resize = function() {
            var s = document.getElementById("_touchproof-sky");
            s.setAttributeNS(null, "width", _base.offsetWidth);
            s.setAttributeNS(null, "height", _base.offsetHeight);
        };


        transition.start = function() {
            var id = getCloud();
            items[id] = id;
            flow(id);
            var t = 2000 + parseInt(12 * Math.random()) * 1000;
            var timeout = setTimeout(function() {
                transition.start();
            }, t);
            queue[timeout] = timeout;
        }


        function flow(id) {
            var e = document.getElementById(id);
            if( ! e) {
                clearTimeout(queue[id]);
                delete queue[id];
                return;
            }

            setTimeout(function() {
                var p = e.getAttributeNS(null, "transform");
                if(p) {
                p = p.slice("translate(".length, -1).replace(",", " ").split(" ");
                x = parseInt(p[0]);
                y = parseInt(p[1]);
                x = x + 2;
                } else {
                    x = -300;
                    y = 0;
                }
                if(x > _base.offsetWidth + 50) {
                    if(e && e.parentNode) {
                        e.parentNode.removeChild(e);
                    }
                    clearTimeout(queue[id]);
                    delete queue[id];
                } else {
                    e.setAttributeNS(null, "transform", "translate(" + [x,y].join(" ") + ")");
                    flow(id);
                }
            }, 50);
        }


        transition.stop = function() {
            for(var id in queue) {
                clearTimeout(queue[id]);
                delete queue[id];
            }
            queue = {};
            for(var id in items) {
                var e = document.getElementById(id);
                if(e) {
                    e.parentNode.removeChild(e);
                }
            }
        };

        return transition;


        function getCloud(id) {
            var id = "_touchproof-cloud-" + parseInt(Math.random() * Math.pow(10, 10)).toString(16);
            var e = document.getElementById(id);
            if(e) {
                return id;
            }
            var w = parseInt(Math.min((_base.offsetWidth / 5), 100) * (1 + Math.random() * 0.5));
            var h = parseInt(w * 0.33);
            var cx = parseInt(w / 2);
            var cy = parseInt(_base.offsetHeight * Math.random());
            var d = getCloudPath(cx, cy, w, h);

            var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
            if( ! document.createElementNS) {
                var e = document.createNode(1, "path", "http://www.w3.org/2000/svg");
            }
            document.getElementById("_touchproof-sky").appendChild(e);
            e.setAttributeNS(null, "id", id);
            e.setAttributeNS(null, "d", d);
            e.setAttributeNS(null, "fill", "#ffffff");
            e.setAttributeNS(null, "filter", "url(#_touchproof-shadow)");
            e.setAttributeNS(null, "transform", "translate(" + [-1.5 * w, 0].join(" ") + ")");
            e.style.opacity = "0.92";
            return id;
        }

        function getCloudPath(cx, cy, w, h) {
            var m = [6,7];
            var n = m[parseInt(m.length * Math.random())];
            var a = w / 2;
            var b = h / 2;
            var c = (2 * Math.PI) / n;
            var s = [];
            var g = sign(1);
            for(var i = 0; i < n; i++) {
                s.push((c * i) + g* (0.5 * Math.random() * c));
            }
            s.sort(function(s1, s2) {
                return parseFloat(s1) - parseFloat(s2);
            });
            var p = [];
            for(var i = 0; i < s.length; i++) {
                var r = s[i];
                var x = a * Math.cos(r);
                var y = b * Math.sin(r);
                var base = Math.pow(b / a, 2) * x;
                var hypo = Math.sqrt(Math.pow(base, 2) + Math.pow(y, 2));
                var cos = base / hypo;
                var sin = y / hypo;
                var depth = 0.30 * a;
                var dt = 30 * Math.PI / 180
                var dx = depth * Math.cos(dt);
                var dy = depth * Math.sin(dt);
                p.push([
                    parseInt(dx*cos + dy*sin + x + cx),
                    parseInt(dx*sin - dy*cos + y + cy)
                ].join(","));
                p.push([
                    parseInt(x + cx),
                    parseInt(y + cy)
                ].join(","));
                p.push([
                    parseInt(dx*cos - dy*sin + x + cx),
                    parseInt(dx*sin + dy*cos + y + cy)
                ].join(","));
            }
            p.push(p.shift());
            p.push(p[0]);
            p[1] = "C" + p[1];

            return "M " + p.join(" ") + " Z";
        }


        function sign(v) {
            return parseInt(Math.random() * 10) % 2 == 0 ? v : -1 * v;
        }

    }



}






