var main =  {
        allPossibleTags: {
            //SUBJUNC,FUT, IVSUFF|SUBJ|3MP|MOOD|I was not in the list
            "stem": ["ABBREV", "ADJ", "ADV", "DEM|PRON|F", "DEM|PRON|FS", "DEM|PRON|FD", "DEM|PRON|MS", "DEM|PRON|MD", "DEM|PRON|MP", "DET", "INTERROG", "NO|STEM", "NOUN", "NOUN|PROP", "NUMERIC|COMMA", "PART", "PRON|1S", "PRON|2MS", "PRON|2FS", "PRON|3MS", "PRON|3FS", "PRON|2D", "PRON|3D", "PRON|1P", "PRON|2MP", "PRON|2FP", "PRON|3MP", "PRON|3FP", "REL|PRON", "PV", "IV", "CV", "VERB|IMPERATIVE", "VERB|IMPERFECT", "VERB|PERFECT", "NO|RESULT"],
            "prefix": ["CONJ", "EMPHATIC|PARTICLE", "FUNC|WORD", "FUT|PART", "FUT", "INTERJ", "INTERROG|PART", "IV1S", "IV2MS", "IV2FS", "IV3MS", "IV3FS", "IV2D", "IV2FD", "IV3MD", "IV3FD", "IV1P", "IV2MP", "IV2FP", "IV3MP", "IV3FP", "NEG|PART", "PREP", "RESULT|CLAUSE|PARTICLE", "SUBJUNC"],
            "suffix": ["CASE|INDEF|NOM", "CASE|INDEF|ACC", "CASE|INDEF|ACCGEN", "CASE|INDEF|GEN", "CASE|DEF|NOM", "CASE|DEF|ACC", "CASE|DEF|ACCGEN", "CASE|DEF|GEN", "NSUFF|MASC|SG|ACC|INDEF", "NSUFF|FEM|SG", "NSUFF|MASC|DU|NOM", "NSUFF|MASC|DU|NOM|POSS", "NSUFF|MASC|DU|ACCGEN", "NSUFF|MASC|DU|ACCGEN|POSS", "NSUFF|FEM|DU|NOM", "NSUFF|FEM|DU|NOM|POSS", "NSUFF|FEM|DU|ACCGEN", "NSUFF|FEM|DU|ACCGEN|POSS", "NSUFF|MASC|PL|NOM", "NSUFF|MASC|PL|NOM|POSS", "NSUFF|MASC|PL|ACCGEN", "NSUFF|MASC|PL|ACCGEN|POSS", "NSUFF|FEM|PL", "POSS|PRON|1S", "POSS|PRON|2MS", "POSS|PRON|2FS", "POSS|PRON|3MS", "POSS|PRON|3FS", "POSS|PRON|2D", "POSS|PRON|3D", "POSS|PRON|1P", "POSS|PRON|2MP", "POSS|PRON|2FP", "POSS|PRON|3MP", "POSS|PRON|3FP", "IVSUFF|DO|1S", "IVSUFF|DO|2MS", "IVSUFF|DO|2FS", "IVSUFF|DO|3MS", "IVSUFF|DO|3FS", "IVSUFF|DO|2D", "IVSUFF|DO|3D", "IVSUFF|DO|1P", "IVSUFF|DO|2MP", "IVSUFF|DO|2FP", "IVSUFF|DO|3MP", "IVSUFF|DO|3FP", "IVSUFF|MOOD|I", "IVSUFF|SUBJ|2FS|MOOD|I", "IVSUFF|SUBJ|D|MOOD|I", "IVSUFF|SUBJ|3D|MOOD|I", "IVSUFF|SUBJ|MP|MOOD|I", "IVSUFF|MOOD|S", "IVSUFF|SUBJ|2FS|MOOD|SJ", "IVSUFF|SUBJ|D|MOOD|SJ", "IVSUFF|SUBJ|MP|MOOD|SJ", "IVSUFF|SUBJ|3MP|MOOD|SJ", "IVSUFF|SUBJ|3MP|MOOD|I", "IVSUFF|SUBJ|FP", "PVSUFF|DO|1S", "PVSUFF|DO|2MS", "PVSUFF|DO|2FS", "PVSUFF|DO|3MS", "PVSUFF|DO|3FS", "PVSUFF|DO|2D", "PVSUFF|DO|3D", "PVSUFF|DO|1P", "PVSUFF|DO|2MP", "PVSUFF|DO|2FP", "PVSUFF|DO|3MP", "PVSUFF|DO|3FP", "PVSUFF|SUBJ|1S", "PVSUFF|SUBJ|2MS", "PVSUFF|SUBJ|2FS", "PVSUFF|SUBJ|3MS", "PVSUFF|SUBJ|3FS", "PVSUFF|SUBJ|2MD", "PVSUFF|SUBJ|2FD", "PVSUFF|SUBJ|3MD", "PVSUFF|SUBJ|3FD", "PVSUFF|SUBJ|1P", "PVSUFF|SUBJ|2MP", "PVSUFF|SUBJ|2FP", "PVSUFF|SUBJ|3MP", "PVSUFF|SUBJ|3FP", "CVSUFF|DO|1S", "CVSUFF|DO|3MS", "CVSUFF|DO|3FS", "CVSUFF|DO|3D", "CVSUFF|DO|1P", "CVSUFF|DO|3MP", "CVSUFF|DO|3FP", "CVSUFF|SUBJ|2MS", "CVSUFF|SUBJ|2FS", "CVSUFF|SUBJ|2MP"]
        },
        bw: function(x, isGrammer) {
            var result = {};
            var match = null;

            var not = true;
            for (var i in myparser.MarMoT.allPossibleTags) {
                for (var j in myparser.MarMoT.allPossibleTags[i]) {
                    if (not && x.indexOf(myparser.MarMoT.allPossibleTags[i][j]) >= 0) {
                        result.type = i;
                        result.pos = myparser.MarMoT.allPossibleTags[i][j].replace(/\|/g, "_");
                        not = false;
                    }
                }
            }
            //if tag is not in the tag set above!
            if (not && isGrammer)
                console.error("tag is not defined! | " + x);

            // irregular, and extract features
            if (/PV/.test(x)) {
                // result.pos = "verb";
                result.aspect = "perfective";
                result.voice = "active";
            }
            if (/PV\|PASS/.test(x)) {
                // result.pos = "verb";
                result.aspect = "perfective";
                result.voice = "passive";
            }
            if (match = /PVSUFF\|DO\|(.)(.)(.)/.exec(x)) {
                // result.pos = "obj";
                result.aspect = "perfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /PVSUFF\|SUBJ\|(.)(.)(.)/.exec(x)) {
                // result.pos = "subj";
                result.aspect = "perfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }


            if (/IV/.test(x)) {
                // result.pos = "verb";
                result.aspect = "imperfective";
                result.voice = "active";
            }

            if (/IV\|PASS/.test(x)) {
                // result.pos = "verb";
                result.aspect = "imperfective";
                result.voice = "passive";
            }
            if (match = /IV([0-9])(.)(.)/.exec(x)) {
                // result.pos = "verb";
                result.aspect = "imperfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /IVSUFF\|DO\|([0-9])(.)(.)/.exec(x)) {
                // result.pos = "obj";
                result.aspect = "imperfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /IVSUFF\|SUBJ\|([0-9]?)(.)(.)\|MOOD\|(.)/.exec(x)) {
                // result.pos = "subj";
                result.aspect = "imperfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }

            if (/CV/.test(x)) {
                // result.pos = "verb";
                result.aspect = "imperative";
            }
            if (match = /CVSUFF\|DO\|([0-9])(.)(.)/.exec(x)) {
                // result.pos = "obj";
                result.aspect = "imperative";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /CVSUFF\|SUBJ\|([0-9])(.)(.)/.exec(x)) {
                // result.pos = "subj";
                result.aspect = "imperative";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }

            //if (myparser.BW.sub[x])
            //result.pos = myparser.BW.sub[x];

            // if (match = /CASE(.)(.)/.exec(x)) {
            //     result.state = match[1];
            //     result["case"] = match[2];
            // }
            if (match = /NSUFF([MF])(.)(.)(.)/.exec(x)) {
                result.gender = match[1];
                result.number = match[2];
                result["case"] = match[3];
                result.possesor = match[4];
            }

            return result;
        },
        savedAyah: null,
        segments: [],
        previousScore: 0,
        counter: 0,
        cu: "prefix",
        sendData: function() {
            var counter = myparser["MarMoT"].counter;
            var segments = myparser["MarMoT"].segments;

            if(segments.length == 0)
                return null;

            var obj = {
                wutf8: buckwalter.bw2utf(myparser["MarMoT"].savedAyah[counter]),
                orig: "",
                // roman: "hw",
                analyses: [],
                wordpos: counter,
            };
            var analysis = {
                prefix: [],
                suffix: [],
                prefix_pos: [],
                suffix_pos: [],
                morphemes: [],
                aspect: "",
                "case": "",
                gender: "",
                mood: "",
                number: "",
                person: "",
                pos: "",
                state: "",
                utf8: "",

            };
            for (var i in segments) {
                obj.orig += JSON.stringify(segments[i]);
                analysis.morphemes.push(getCleanCopy(segments[i]));
                if (segments[i].type == "prefix") {
                    segments[i].utf8 = buckwalter.bw2utf(segments[i].utf8.substr(0, segments[i].utf8.length - 1));
                    var current = "prefix";

                    analysis[current].push(segments[i]);
                    analysis[current + "_pos"].push(segments[i].pos);
                } else if (segments[i].type == "suffix") {
                    segments[i].utf8 = buckwalter.bw2utf(segments[i].utf8.substr(1, segments[i].utf8.length));
                    var current = "suffix";

                    analysis[current].push(segments[i]);
                    analysis[current + "_pos"].push(segments[i].pos);
                } else {
                    // segments[i].type = "main";
                    for (var x in segments[i])
                        analysis[x] = segments[i][x];
                }
            }

            // obj.roman = buckwalter.utf2bw(obj.utf8);
            obj.analyses.push(analysis);

            return obj;
        },
        previousScore: 0,
        postprocess: function(data) {
            /**
             * This is to re-unite the segmented words
             ***/
            var th = myparser["MarMoT"];

            if (!th.savedAyah) {
                var raw = argv.source
                //remove short vowels
                th.savedAyah = raw
                    //.replace(/[\u064b-\u065f]/g, '') // shortvowels
                    //.replace(/[\u0622\u0623\u0625]/g, '\u0627') // hamza
                    // .replace(/[\u0649]/g,'\u064A') // yaa
                    .split(" ");
            }
            //TRICK to send the last data, by sending null as paramater
            // if (data == null) {
            //     return th.sendData();
            // }


            var segments = th.segments;
            if (data.utf8.charAt(data.utf8.length - 1) == "#") {
                if (th.cu == "suffix" || th.cu == "stem") {
                    //console.error(th.sendData())
                    this.emit("data", th.sendData());
                    th.segments = [];
                    th.counter++;
                }

                th.segments.push(data);
                th.cu = "prefix";
            } else if (data.utf8.charAt(0) == "+") {

                th.segments.push(data);
                th.cu = "suffix";
            } else {
                if (th.cu == "suffix" || th.cu == "stem") {
                    this.emit("data", th.sendData());
                    th.segments = [];
                    th.counter++;
                }
                th.segments.push(data);
                th.cu = "stem";
            }

        },
        process: function(text, callback) {
            // var th = myparser["Qutuf"];
            if (!text)
                return callback(null);
            var matches = /([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)[ \t]+([^ ]+)/.exec(text);
            if (!matches) {
                // console.error(text);
                return callback(null);
            }
            var morpheme = {
                // orig: text,
                utf8: matches[9],
                wordpos: matches[1],
                // analyses: [],
            };
            var first = matches[6].split("|");
            var second = matches[8].split("|");

            // var obj = {
            //     type: first[0],
            //     pos: first[1],
            //     morph: myparser["MarMoT"].bw(matches[8]),
            // }
            morpheme.unknowntype = first[0],
            morpheme.pos = first[1];
            morpheme.morph = myparser["MarMoT"].bw(matches[8]);

            morpheme.type = morpheme.morph.type,

                // obj.morph.pos = second[0];
                morpheme.morph.orig = matches[8];
            // morpheme.analyses.push(obj);
            callback(null, morpheme);
        },
    },
