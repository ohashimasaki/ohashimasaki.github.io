function parseChineseNumerals(t) {

    var numerals = {
        "両": "両\u4E24\u5169", // 两兩
        "十": "十\u4EC0\u62FE\uF973\uF9FD\u3038", // 什拾拾什〸
        "百": "百\u4F70\u964C",  // 佰陌
        "千": "千\u4EDF\u9621",  // 仟阡
        "万": "万萬",
        "億": "億\u4EBF", // 亿
        "兆": "兆",
        "京": "京",
        "垓": "垓",
        "秭": "秭\u{25771}",  // 秭𥝱
        "穣": "穣",
        "溝": "溝",
        "0": "０〇零",
        "1": "１一\u58F1\u58F9\u5F0C\u3021", // 壱壹弌〡
        "2": "２二\u3483\u5F0D\u5F10\u8CAE\u8CB3\u8D30\u{22390}\u3022",  // 㒃弍弐貮貳贰𢎐〢
        "3": "３三\u4EE8\u53C2\u53C3\u53C4\u5F0E\uF96B\u3023",  // 仨参參叄弎叁參〣
        "4": "４四\u4E96\u8086\u4989\u3024",  // 亖肆䦉〤
        "5": "５五\u4F0D\u3025",  // 伍〥
        "6": "６六\u9646\u9678\uF9D3\u3026",  // 陆陸陸〦
        "7": "７七\u3B4D\u67D2\u6F06\u3027", // 㭍柒漆〧
        "8": "８八\u634C\u3028",  // 捌〨
        "9": "９九\u7396\u3029",  // 玖〩
        "2十": "\u5344\u5EFF\u3039", // 〹卄廿
        "3十": "\u5345\u4E17\u303A", // 〺卅丗
        "4十": "\u534C\u{2098C}\u{2099C}", // 卌𠦌𠦜
        ".": "・点點"
    };

    var digits = "(?:" + [
        "\\d?千(?:\\d?百|\\d)?(?:\\d?十|\\d)?\\d?",
        "\\d?百(?:\\d?十|\\d)?\\d?",
        "\\d?十\\d?",
        "\\d{1,4}"
    ].join("|") + ")";

    var ranks = ["","万","億","兆","京","垓","秭","穣","溝"];

    var s = t.replace(/\s/g, "");

    if( ! s) {
        return t;
    }

    var p = [];
    for(var n in numerals) {
        p.push(numerals[n]);
    }

    var regex = new RegExp("[" + p.join("") + "]+", "g");

    t = t.replace(regex, function(m) {
        return replaceChineseNumerals(m);
    });

    return t;




   //----------------------------------------------------------------------------------------------------
   function replaceChineseNumerals(t) {

        var s = normalize(t);

        if( ! isNumber(s)) {
            return t;
        }


        var f = "";

        if(/\./.test(s)) {
            f = "." + (s.split(".")[1] || "0");
            s = s.split(".")[0] || "0";
        }


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
                var e = replaceMyriads(v);
                n.push(e);

            } else {
                n.push("0000");
            }

            if(s.length == 0) {
                break;
            }
        }

        return n.reverse().join("").replace(/^0+([1-9])/g, "$1") + f;


    }
    //----------------------------------------------------------------------------------------------------
    function normalize(t) {

        for(var n in numerals) {
            var regex = new RegExp("[" + numerals[n] + "]", "g");
            t = t.replace(regex, n);
        }

        t = t.replace(/両([十百千万億])/g, "2$1");

        return t;

    }
    //----------------------------------------------------------------------------------------------------
    function isNumber(t) {

        if((new RegExp("^" + digits + "(?:\\.\\d+)?$")).test(t)) {
            return true;
        }

        if(/[溝穣秭垓京兆億万]/.test(t) && ! (new RegExp("^(?:" + digits + "?[溝穣秭垓京兆億万])+" + digits + "?(?:\\.(?:\\d+)?)?$")).test(t)) {
            return false;
        }

        if(/溝/.test(t) && ! /^[^溝穣秭垓京兆億万]*溝[^溝]*$/.test(t)) {
            return false;
        }
        if(/穣/.test(t) && ! /^[^穣秭垓京兆億万]*穣[^穣]*$/.test(t)) {
            return false;
        }
        if(/秭/.test(t) && ! /^[^秭垓京兆億万]*秭[^秭]*$/.test(t)) {
            return false;
        }
        if(/垓/.test(t) && ! /^[^垓京兆億万]*垓[^垓]*$/.test(t)) {
            return false;
        }
        if(/京/.test(t) && ! /^[^京兆億万]*京[^京]*$/.test(t)) {
            return false;
        }
        if(/兆/.test(t) && ! /^[^兆億万]*兆[^兆]*$/.test(t)) {
            return false;
        }
        if(/億/.test(t) && ! /^[^億万]*億[^億]*$/.test(t)) {
            return false;
        }
        if(/万/.test(t) && ! /^[^万]*万[^万]*$/) {
            return false;
        }

        if(/十\d*[百千]/.test(t)) {
            return false;
        }
        if(/百\d*千/.test(t)) {
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
    function replaceMyriads(t) {

        var n = 0;

        t = t.replace(/(\d+|^)千/, function(m, s) {
            n += isNaN(parseInt(s)) ? 1000 : parseInt(s) * 1000; 
        });

        t = t.replace(/(\d+|^|\D)百/, function(m, s) {
            n += isNaN(parseInt(s)) ? 100 : parseInt(s) * 100; 
        });

        t = t.replace(/(\d+|^|\D)十/, function(m, s) {
            n += isNaN(parseInt(s)) ? 10 : parseInt(s) * 10; 
        });

        t = t.replace(/(\d+)$/, function(m, s) {
            n += isNaN(parseInt(s)) ? 0 : parseInt(s) ; 
        });

        return ("0000" + n).slice(-4);

    }
    //----------------------------------------------------------------------------------------------------

}











