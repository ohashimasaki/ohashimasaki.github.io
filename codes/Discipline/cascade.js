function Cascade() {

    var cascade = this;
    var selectors = [];
    var items = {};


    this.add = function(id) {
        id = trim(id);
        var e = document.getElementById(id);
        if( ! e || typeof e != "object" || e.nodeType != 1 || ! /^select$/i.test(e.tagName)) {
            return cascade;
        }
        if(selectors.indexOf(id) < 0) {
            selectors.push(id);
        }
        return cascade;
    };

    this.set = function() {
        if(selectors.length < 2) {
            return;
        }
        chain();
    }




    //----------------------------------------------------------------------------------------------------
    function chain() {

        for(var j = 0; j < selectors.length; j++) {
            var id = selectors[j];
            var e = document.getElementById(id);
            if( ! e.cascading &&  ! items[id]) {
                items[id] = {};
                if(j > 0) {
                    items[id].options = [];
                    var options = e.options;
                    for(var i = 0; i < options.length; i++) {
                        items[id].options.push(options[i].cloneNode(true));
                    }
                    clear(e);
                }
                 if(j < selectors.length - 1) {
                    items[id].next = selectors[j + 1];
                    e.addEventListener("change", function() {
                        react(this);
                    }, false);
                }
                e.cascading = true;
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function react(e) {

        var id = e.getAttribute("id");
        if( ! items[id] ||  ! items[id].next) {
            return;
        }
        var next = document.getElementById(items[id].next);
        clear(next);
        append(next, e.value);
        react(next);

    } 
    //----------------------------------------------------------------------------------------------------
    function clear(e) {

        e.innerHTML = "";

    }
    //----------------------------------------------------------------------------------------------------
    function append(e, value) {

        var id = e.getAttribute("id");
        var options = items[id].options;
        for(var i = 0; i < options.length; i++) {
            var option = options[i];
            if(option.getAttribute("data-class") == value || ! option.getAttribute("data-class")) {
                e.appendChild(options[i].cloneNode(true));
            }
        }

    }
    //----------------------------------------------------------------------------------------------------
    function trim(t) {

        if(t == null || typeof t != "string") {
            return t;
        }

        return t.replace(/^\s+|\s+$/g, "");

    }
    //----------------------------------------------------------------------------------------------------


}








































