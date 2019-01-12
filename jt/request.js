function Request() {

    var request = {};

    request.get = function(o) {
        send("GET", o);
    }
    request.post = function(o) {
        send("POST", o);
    }

    function send(method, o) {
        var xmlhttp = new XMLHttpRequest;
        xmlhttp.open(method, o.url, o.async);
        try {
            xmlhttp.responseType = "msxml-document";
        } catch(e) {}

        if(method == "POST") {
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        if(o.async === true) { // ASYNC
            xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4 && xmlhttp.status >= 200) {
                    callback(o.callback, xmlhttp);
                }
            }
            try {
                xmlhttp.send(o.payload || "");
            } catch(e) {
                callback(o.callback, xmlhttp);
            }
        } else { // SYNC
            try {
                xmlhttp.send(o.payload || "");
            } catch(e) {
                callback(o.callback, xmlhttp);
            }
            callback(o.callback, xmlhttp);
        }
    }

    return request;



    function callback(f, xmlhttp) {
        if(typeof f != "function") {
            return;
        }
        f({
            xml: xmlhttp.responseXML,
            text: xmlhttp.responseText,
            type: xmlhttp.responseType,
            status: xmlhttp.status
        });
    }



}














