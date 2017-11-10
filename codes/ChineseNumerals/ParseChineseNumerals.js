function parseChineseNumerals(t) {

    if( ! t) {
        return t;
    }

    var ranks = [
        "十\u4EC0\u62FE\uF973\uF9FD\u3038", // 什拾拾什〸
        "百\u4F70\u964C",  // 佰陌
        "千\u4EDF\u9621",  // 仟阡
        "万萬",
        "億\u4EBF", // 亿
        "兆",
        "京",
        "垓",
        "秭\u{25771}",  // 秭𥝱
        "穣",
        "溝"
    ];

    var numbers = [
        "0０〇\u96F6\uF9B2",  // 零零 
        "1１一\u58F1\u58F9\u5F0C\u3021", // 壱壹弌〡
        "2２二\u3483\u5F0D\u5F10\u8CAE\u8CB3\u8D30\u{22390}\u3022",  // 㒃弍弐貮貳贰𢎐〢
        "3３三\u4EE8\u53C2\u53C3\u53C4\u5F0E\uF96B\u3023",  // 仨参參叄弎叁參〣
        "4４四\u4E96\u8086\u4989\u3024",  // 亖肆䦉〤
        "5５五\u4F0D\u3025",  // 伍〥
        "6６六\u9646\u9678\uF9D3\u3026",  // 陆陸陸〦
        "7７七\u3B4D\u67D2\u6F06\u3027", // 㭍柒漆〧
        "8８八\u634C\u3028",  // 捌〨
        "9９九\u7396\u3029"  // 玖〩
    ];

    var tens = [
        "\u5344\u5EFF\u3039", // 〹卄廿
        "\u5345\u4E17\u303A", // 〺卅丗
        "\u534C\u{2098C}\u{2099C}" // 卌𠦌𠦜
    ];

    var liang = [
        "両\u4E24\u5169"
    ];
    var point = [
        ".\u30FB点\u9EDE"
    ];

    var s = t;
    s = normalize(s, tens);
    s = normalize(s, numbers);
    s = normalize(s, ranks);
    s = normalize(s, liang);
    s = normalize(s, point);

    s = s.replace(/\u5344/g, "2十");  // 卄
    s = s.replace(/\u5345/g, "3十");  // 卅
    s = s.replace(/\u534C/g, "4十");  // 卌
    s = s.replace(/万亿/g, "兆");
    s = s.replace(/万万/g, "億");
    s = s.replace(new RegExp("両([" + ranks.slice(1).join("") + "])", "g"), "2$1");
    s = s.replace(/両(?!$)/g, "2");


    for(var i = 0; i < ranks.length; i++) {
        var rank = ranks[i].substr(0, 1);
        var n = (i <= 3) ? (i + 1) : ((i - 2) * 4);
        s = s.replace(new RegExp("(.|^)" + rank + "(\\d{1," + n + "}|(?:\\D|$))", "g"), function(m, s1, s2) {
            return (/^\d$/.test(s1) ? s1 : "1") + getInteriorZeroes(s2, n) + s2;
        });
    }

    return s;

    function getInteriorZeroes(s, n) {
        var d = s.match(/^\d*/);
        var c = d ? d[0].length : n;
        var z = "";
        for(var i = 0; i < (n - c); i++) {
            z = z + "0";
        };
        return z;
    }

    function normalize(s, numerals) {
        for(var i = 0; i < numerals.length; i++) {
            var n = numerals[i];
            if(n.length > 1) {
                s = s.replace(new RegExp("[" + n.substr(1) + "]", "g"), n.substr(0, 1));
            }
        }
        return s;
    }

}















