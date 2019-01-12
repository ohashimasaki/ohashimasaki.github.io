function Textbox() {

    var textbox = {};

    textbox.elasticate = function(e, test) {

        this.length = length;

        // ENABLE TAB ENTERING
        e.addEventListener("keydown", function(event) {
            if(event.keyCode == 9 && event.ctrlKey) {
                suppress(event);
                if(event.target) {
                    var u = event.target;
                    var t = u.value;
                    var p = u.selectionStart + 1;	
                    u.value = t.substr(0, u.selectionStart) + "\t" + t.substr(u.selectionEnd);
                    u.setSelectionRange(p, p);
                } else {
                    var range = document.selection.createRange();
                    range.text = "\t" + range.text;
                }
            }
        }, false);


        e.addEventListener("keyup", function(event) {
            var k = event.keyCode;
            var BS = 8;
            var DEL = 46;

            if( ! ((48 <= k && k <= 57) || (65 <= k && k <= 90) ||
                (96 <= k && k <= 111) || (186 <= k && k <= 192) ||
                ([8,13,16,17,32,46,219,220,221,222,226].indexOf(k) >= 0))) {
                return;
            }
            suppress(event);
            var fontSize = parseInt(getComputedStyle(this, null).getPropertyValue("font-size"));
            var minHeight = parseInt(getComputedStyle(this, null).getPropertyValue("min-height"));
            var border = parseInt(getComputedStyle(this, null).getPropertyValue("border-top-width"));
            border += parseInt(getComputedStyle(this, null).getPropertyValue("border-bottom-width"));
            // offsetHeight vs scrollHeight (not contains borders, contains paddings)
            var scrollHeight = this.scrollHeight;
            var length = this.value.length;

            if(length == this.length) {
                return;
            }

            if(k == BS || k == DEL || length < this.length) {
                for(var h = this.offsetHeight; h > minHeight; h--) {
                    this.style.height = h + "px";				
                    var d =  this.scrollHeight - h;
                    if(d > 0) {
                        break;
                    }
                }
                this.style.height = (h + border + d) + "px";
            } else if(this.offsetHeight < scrollHeight) {
                this.style.height = (scrollHeight + border) + "px";
            }
            this.length = length;
        }, false);


        e.addEventListener("cut", function(event) {
            setTimeout(function() {
                stretch(event.target || event.srcElement);
            }, 10);
        }, false);

        e.addEventListener("paste", function(event) {
            setTimeout(function() {
                stretch(event.target || event.srcElement);
            }, 10);
        }, false);

        e.addEventListener("change", function(event) {
            setTimeout(function() {
                stretch(event.target || event.srcElement);
            }, 10);
        }, false);

    };



    textbox.adjust = function(a, test) {
        adjust(a, test);
    }

    textbox.stretch = function(e, test) {
        stretch(e, test);
    }

    function adjust(a, test) {
        if(a.length == 0) {
            return;
        }
        var e = a.shift();
        stretch(e, test);

        if(a.length > 0) {
            adjust(a, test);
        }
    }

    function stretch(e, test) {
        if(e.length == e.value.length) {
            return true;
        }
        var minHeight = parseInt(getComputedStyle(e, null).getPropertyValue("min-height"));
        var border = parseInt(getComputedStyle(e, null).getPropertyValue("border-top-width"));
        border += parseInt(getComputedStyle(e, null).getPropertyValue("border-bottom-width"));
        var maxHeight = parseInt(getComputedStyle(e, null).getPropertyValue("max-height"));
        maxHeight = isNaN(maxHeight) ? 1000 : maxHeight;

        // offsetHeight vs scrollHeight (not contains borders, contains paddings);
        for(var h = minHeight; h < maxHeight; h++) {
            e.style.height = h + "px";
            var d =  e.scrollHeight - h;
            if(d <= 0) {
                break;
            }
        }
        e.style.height = (h + border + d) + "px";
        e.length = e.value.length;
        return true;
    }


    function suppress(event) {
        if(event && event.cancelBubble) {
            event.cancelBubble = true;
            event.returnValue = false;
        } else {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    return textbox;


}





















