function parseChineseNumerals(t) {

    var digits = "(?:" + [
        "\\d?[千阡仟](?:\\d?[百陌佰]|\\d)?(?:\\d?[十拾]|\\d)?\\d?",
        "\\d?[百陌佰](?:\\d?[十拾]|\\d)?\\d?",
        "\\d?[十拾]\\d?",
        "\\d{1,4}"
    ].join("|") + ")";

    var ranks = [
        "",
        "[万萬]",
        "億",
        "兆",
        "京",
        "垓",
        "[秭𥝱]",
        "穣",
        "溝",
        "澗",
        "正",
        "載",
        "極"
    ];

    var s = t.replace(/\s/g, "");

    if( ! s) {
        return t;
    }

    s = s.replace(/[廿卄]/g, "二十").replace(/[卅丗]/g, "三十").replace(/[卌]/g, "四十");
    s = s.replace(/[・点點]/g, ".");
    s = replaceNumerals(s);

    if( ! isNumber(s)) {
        return t;
    }

    s = s.split(".");

    var f = s[1] ? "." + s[1] : "";

    s = s[0] || "0";

    if(/^\d+$/.test(s)) {
        return s.replace(/^0+([1-9])/g, "$1") + f;
    }


    var n = [];

    for(var i = 0; i < ranks.length; i++) {
        var pattern = "(" + digits + ")?" + ranks[i] + "$";
        var regex = new RegExp(pattern);
        var d = s.match(regex);

        if(d && d[1] == "0" && ranks[i]) {
            s = s.substr(0, s.length - d[0].length);
            n.push("0000");
        } else if(d && d.length >= 2) {
            s = s.substr(0, s.length - d[0].length);
            var v = d[1] ? d[1] : (ranks[i] ? "0001" : "0000");
            var e = replaceDigits(v);
            n.push(e);
        } else {
            n.push("0000");
        }
        if(s.length == 0) {
            break;
        }
    }

    return n.reverse().join("").replace(/^0+([1-9])/g, "$1") + f;


    //----------------------------------------------------------------------------------------------------
    function isNumber(t) {

        if((new RegExp("^" + digits + "(?:\.\d+)?$")).test(t)) {
            return true;
        }

        if((new RegExp("^(?:(?:" + digits + ")?[垓京兆億万萬])+(?:\.\d+)?$")).test(t)) {
            return false;
        }

        if(/垓/.test(t) && ! /^[^垓京兆億万萬]*垓[^垓]*$/.test(t)) {
            return false;
        }
        if(/京/.test(t) && ! /^[^京兆億万萬]*京[^京]*$/.test(t)) {
            return false;
        }
        if(/兆/.test(t) && ! /^[^兆億万萬]*兆[^兆]*$/.test(t)) {
            return false;
        }
        if(/億/.test(t) && ! /^[^億万萬]*億[^億]*$/.test(t)) {
            return false;
        }
        if(/[万萬]/.test(t) && ! /^[^万萬]*[万萬][^万萬]*$/) {
            return false;
        }

        if(/[十拾]\d*[百陌佰千阡仟]/.test(t)) {
            return false;
        }
        if(/[百陌佰]\d*[千阡仟]/.test(t)) {
            return false;
        }

        if(/\./.test(t) && t.split(".").length > 2) {
            return false;
        }

        if(/\./.test(t) && ! /\.\d*$/.test(t)) {
            return false;
        }

        //Presumed Innocent

        return true;

    }
    //----------------------------------------------------------------------------------------------------
    function replaceDigits(t) {

        var n = 0;

        t = t.replace(/(\d+|^)[千阡仟]/, function(m, s) {
            n += isNaN(parseInt(s)) ? 1000 : parseInt(s) * 1000; 
        });
        t = t.replace(/(\d+|^|\D)[百陌佰]/, function(m, s) {
            n += isNaN(parseInt(s)) ? 100 : parseInt(s) * 100; 
        });
        t = t.replace(/(\d+|^|\D)[十拾]/, function(m, s) {
            n += isNaN(parseInt(s)) ? 10 : parseInt(s) * 10; 
        });
        t = t.replace(/(\d+)$/, function(m, s) {
            n += isNaN(parseInt(s)) ? 0 : parseInt(s) ; 
        });

        return ("0000" + n).slice(-4);

    }
    //----------------------------------------------------------------------------------------------------
    function replaceNumerals(t) {

        var numerals = {
            "0": /[０〇零洞]/g,
            "1": /[１一壱壹弌幺]/g,
            "2": /[２二弐貳貮贰两兩両]/g,
            "3": /[３三参參弎叁叄]/g,
            "4": /[４四肆䦉刀]/g,
            "5": /[５五伍]/g,
            "6": /[６六陆陸]/g,
            "7": /[７七柒漆拐]/g,
            "8": /[８八捌]/g,
            "9": /[９九玖勾]/g
         };

        for(var n in numerals) {
            t = t.replace(numerals[n], n);
        }

        return t;

    }
    //----------------------------------------------------------------------------------------------------

}














