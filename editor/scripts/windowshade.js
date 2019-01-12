function WindowShade(id) {

    var shade = {};

    id = id ? id : ("00000000" + parseInt(Math.random() * 100000000)).slice(-8);
    shade.id = "windowshade." + id;

    var _shade = document.getElementById(shade.id);

    if( ! document.getElementById(shade.id)) {
        _shade = document.createElement("div");
        _shade.id = shade.id;
        _shade.className = "windowshade";
        document.body.appendChild(_shade);
    }

    shade.show = function(ht, onclick) {
        if(typeof onclick == "function") {
            _shade.onclick = onclick;
        }
        _shade.style.width = document.body.innerWidth + "px";
        _shade.style.height = document.body.innerHeight + "px";
        _shade.style.display = "block";
        window.addEventListener("resize", function() {
            _shade.style.width = document.body.innerWidth + "px";
            _shade.style.height = document.body.innerHeight + "px";
        }, false);
    };

    shade.hide = function() {
        var _shade = document.getElementById(shade.id);
        _shade.parentNode.removeChild(_shade);
    };

    return shade;


}




















