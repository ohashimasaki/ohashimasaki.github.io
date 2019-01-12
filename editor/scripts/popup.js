function Popup() {

    var popup = {};

    var id = ("00000000" + parseInt(Math.random() * 100000000)).slice(-8);
    popup.id = "popup." + id;

    var _popup = document.createElement("div");
    _popup.id = popup.id;
    _popup.className = "popup";
    document.body.appendChild(_popup);

    var shade = new WindowShade(id);

    popup.show = function(title, ht) {
        shade.show();
        _popup.style.height = "auto";
        _popup.innerHTML = [
            '<div class="popup-content" id="' + _popup.id + '.content">',
                '<div class="popup-header">',
                    '<button class="popup-close" id="' + popup.id + '.close"></button>',
                    '<h1>' + title + '</h1>',
                '</div>',
                '<div class="popup-body" id="' + _popup.id + '.body">' + ht + '</div>',
            '</div>'
        ].join("\r\n");

        document.getElementById(_popup.id + ".content").style.overflowY = "none";
        document.getElementById(_popup.id + ".content").style.height = "none";
        document.getElementById(_popup.id + ".body").style.overflowY = "none";

        var wh = getWindowHeight();
        var oh = _popup.offsetHeight;
        var h = Math.min(oh, wh * 0.8);
        _popup.style.height = h + "px";
        _popup.style.top = (wh - h) / 2 + "px";

        document.getElementById(popup.id + ".close").onclick = function() {
            popup.hide();
        }

        setTimeout(function() {
            _popup.style.display = "block";
            _popup.firstElementChild.scrollTop = "0px";
            _popup.firstElementChild.focus();
            _popup.scrollTop = "0px";
        }, 10);
    };


    popup.hide = function() {
        _popup.style.display = "none";
        _popup.innerHTML = "";
        _popup.parentNode.removeChild(_popup);
        _popup = null;
        shade.hide();
    };


    return popup;


    //----------------------------------------------------------------------------------------------------
    function getWindowHeight() {

        if(document.compatMode.toLowerCase() == "backcompat") {
　           return document.body.clientHeight;
        } else {
            return document.documentElement.clientHeight;
        }

    }
    //----------------------------------------------------------------------------------------------------


}































