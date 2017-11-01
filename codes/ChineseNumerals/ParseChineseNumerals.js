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

    var is_number = new RegExp([
        "^",
        "(?:" + digits + "?溝)?",
        "(?:" + digits + "?穣)?",
        "(?:" + digits + "?秭)?",
        "(?:" + digits + "?垓)?",
        "(?:" + digits + "?京)?",
        "(?:" + digits + "?兆)?",
        "(?:" + digits + "?億)?",
        "(?:" + digits + "?万)?",
        digits + "?",
        "(?:\\.(?:\\d+)?)?",
        "$"
    ].join(""));


    var s = t.replace(/\s/g, "");

    if( ! s) {
        return t;
    }

    var p = [];

    for(var n in numerals) {
        p.push(numerals[n]);
    }

    t = t.replace(new RegExp("[" + p.join("") + "]+", "g"), function(m) {
        return replaceChineseNumerals(m);
    });

    return t;


   //----------------------------------------------------------------------------------------------------
   function replaceChineseNumerals(t) {

        var s = normalize(t);

        if( ! s || ! is_number.test(s)) {
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
                var e = replaceMyriad(v);
                n.push(e);

            } else {
                n.push("0000");
            }

            if(s.length == 0) {
                break;
            }
        }


        n = n.reverse().join("").replace(/^0+([1-9])/g, "$1") + f;

        return n;


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
    function replaceMyriad(t) {

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

        n = ("0000" + n).slice(-4);

        return n;

    }
    //----------------------------------------------------------------------------------------------------

}











