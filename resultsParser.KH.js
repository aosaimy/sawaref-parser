var include = require('./resultsParser.include.js');
var main =  {
    obj: {
                "analyses": [],
                "orig": ""
    },
    c: function(text,obj) {
        for(key in obj){
            var m = text.match(obj[key]);
            if(m==null)
                continue;
            return key;
        }
        return 
    },
    process: function(lines, callback) {
        var obj = main.obj;
        if(lines == ""){
            callback(null,obj)

            main.obj = {
                "analyses": [],
                "orig": ""
            }

            return;
        }
        obj.orig += lines.replace(/"/g,"");

        var segs = lines.split("\",\"")
        if ( segs.length == 1){
            obj.wutf8 = segs[0].replace("\"","").replace("#","")
            callback(null,undefined)
            return;
        }
        var a = {}
        //rr.getVoweledWord() +"\",\"" + rr.getPrefix() +"\",\"" + rr.getPrefNoDec() 
        //+"\",\"" + rr.getStem() +"\",\"" + rr.getType() +"\",\"" + 
        //rr.getDiacPatternStem() +"\",\"" + rr.getPatternStem() +"\",\"" + rr.getLemma() 
        //+"\",\"" + rr.getPatternLemma() +"\",\"" + rr.getRoot() +"\",\"" + 
        //rr.getPostag() +"\",\"" + rr.getSuffix() +"\",\"" + rr.getSufNoDec() +"\",\"" + rr.getPriority() + "\"\n";
        a.utf8 = segs[0].replace("\"","")
        a.prefix = [{
            "utf8": segs[2],
            "pos": segs[1]
        }];
        a.stem = segs[3];
        a.pos = segs[4];
        a.diacpattern = segs[5];
        a.pattern = segs[6];

        a.lem = segs[7];
        a.lemPattern = segs[8];
        a.root = segs[9];
        a["pos-orig"] = segs[10];

        //TODO parse pos-orig
        a.noRootLetters = main.c(a["pos-orig"],{
            "3":"ثلاثي",
            "4":"رباعي",
            "5":"خماسي",
            "6":"سداسي",
        });

        a.isAugmented = main.c(a["pos-orig"],{
            "true":"مزيد",
            "false":"مجرد",
        });

        a.person = main.c(a["pos-orig"].replace(/[\u064b-\u065f]/g, ''),{
            "2":"مسند إلى المخاطب",
            "1":"مسند إلى المتكلم",
            "3":"مسند إلى الغائب",
        });

        a.gender = main.c(a["pos-orig"],{
            "f":"مؤنث",
            "m":"مذكر",
        });

        a.transitivity = main.c(a["pos-orig"],{
            "io":"متعد ولازم",
            "i":"لازم",
            "o":"متعدي",
        });
        a.number = main.c(a["pos-orig"],{
            "s":"مفرد",
            "d":"مؤنث",
            "p":"جمع",
        });
        a.case = a.mood = main.c(a["pos-orig"],{
            "n":"مرفوع",
            "a":"منصوب",
            "g":"مجرور",
            "j":"مجزوم",
        });
        a.state = main.c(a["pos-orig"],{
            "d":"في حالة التعريف",
            "j":"نكرة",
            "r":"في حالة الإضافة",
        });
        a.state = main.c(a["pos-orig"],{
            "d":"في حالة التعريف",
            "j":"نكرة",
            "r":"في حالة الإضافة",
        });
        a.voice = main.c(a["pos"],{
            "d":"مبني للمعلوم",
            "j":"مبني للمجهول",
        });
        a.aspect = main.c(a["pos"],{
            "c":"مضارع",
            "p":"ماضي",
            "i":"أمر",
        });



        // convert to morpheme-based annotation
        //----------------

        a.morphemes = [];
        a.prefix = [];
        a.prefix_pos = [];
        a.suffix_pos = [];
        a.suffix = [];

        a.prefix_utf8 = segs[2]
        if(segs[1]!="#"){
            a.prefix.push({pos:segs[1]});
            var s = segs[1].split("+");
            for (var kk in s) {
                a.prefix_pos.push(s[kk]);
                a.morphemes.push({
                    pos: s[kk],
                    type: "prefix"
                });
            }
        }

        a.morphemes.push({
            "utf8":a.utf8,
            "stem":a.stem,
            "pos":a.pos,
            "diacpattern":a.diacpattern,
            "pattern":a.pattern,
            "lem":a.lem,
            "lemPattern":a.lemPattern,
            "root":a.root,
            "pos-orig": a["pos-orig"],
        });
        var mor = ["isAugmented","person", "gender", "transitivity", "number", "mood","case", "state", "state", "voice", "aspect"];
        for( var x in mor)
            if(a[mor[x]])
                a.morphemes[a.morphemes.length-1][mor[x]]=a[mor[x]]

        a.suffix_utf8 = segs[12]
        if(segs[11]!="#"){
            a.suffix = [{pos:segs[11]}];
            var s = segs[11].split("+");
            for (var kk in s) {
                a.suffix_pos.push(s[kk]);
                a.morphemes.push({
                    pos: s[kk],
                    type: "suffix"
                });
            }
        }

        ///--- DEBUG
        var positions= {
            // "pos": 1,
            "mood": 11,
            "case": 11,
            "aspect": 3,
            "gender": 7,
            "person": 9,
            "number": 8,
            "voice": 14,
            "state": 13,
        };
        var str = [];
        for (var e = 0; e < 22; e++) {
            str[e] = "?";
        };

        for (var k in positions) {
            var value = a[k];
            str[positions[k]] = !value ? "?" : value;
        }
        a["pos-orig"]+= "  "+str.join("")

        //------------

        a.priority = segs[13].replace("\"","");
        obj.analyses.push(a);
        callback(null,undefined)
    },
    AlKhalil: {
        process: function(data, callback) {
            var result = {
                analyses: [],
                orig: JSON.stringify(data, null, 1)
            }
            if (data.error) {
                result.error = data.error;
                return callback(null, result);
            }


            for (var j in data.analyses) {
                var d = data.analyses[j];
                var r = {
                    morphemes: [],
                };
                var main = {};
                main.pattern = d.pattern;
                main.root = d.root;
                main.stem = d.stem;
                main.utf8 = d.voweledWord;
                main.priority = d.priority;

                r.suffix = d.suffix;
                r.prefix = d.prefix;
                r.suffix_pos = [];
                r.prefix_pos = [];



                for (var k in d.pos) {
                    if (k != "orig")
                        main[k] = d.pos[k];
                }

                for (var k in d.type) {
                    if (k != "orig")
                        main[k] = d.type[k];
                }

                main["pos-orig"] = d.pos["orig"];
                main["pos"] = d.type["orig"];

                if (d.prefix && d.prefix.orig.trim() != "#") {
                    var s = d.prefix.orig.split("+");
                    for (var kk in s) {
                        r.prefix_pos.push(s[kk]);
                        r.morphemes.push({
                            pos: s[kk],
                            type:"prefix"
                        });
                    }
                }
                var cleanCopy = include.getCleanCopy(main);
                cleanCopy.type="stem";
                r.morphemes.push(cleanCopy);

                if (d.suffix && d.suffix.orig.trim() != "#") {
                    var s = d.suffix.orig.split("+");
                    for (var kk in s) {
                        r.suffix_pos.push(s[kk]);
                        r.morphemes.push({
                            pos: s[kk],
                            type: "suffix"
                        });
                    }
                }


                for (var k in main) {
                    r[k] = main[k];
                }

                result.analyses.push(r);
            }
            callback(null, result);
        }
    }
}
module.exports = main