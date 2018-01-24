var include = require('./resultsParser.include.js');
var main =  {
        sub: {
            "PUNC": "punctuation",
            "ABBREV": "abbreviation",
            "INTERJ": "interjection",
            "LATIN": "latin",
            "FOREIGN": "foreign",
            "TYPO": "typo",
            "PARTIAL": "partial",
            "DIALECT": "dialectal",
            "DET": "determiner",
            "PRON": "pronoun",
            "ADV": "adverb",
            "ADJ": "adjective",
            "NOUN": "noun",
        },
        allPossibleTags: {
            //SUBJUNC,FUT, IVSUFF_SUBJ:3MP_MOOD:I was not in the list
            "prefix": ["CONJ", "EMPHATIC_PARTICLE", "FUNC_WORD", "FUT_PART", "FUT", "INTERJ", "INTERROG_PART", "IV1S", "IV2MS", "IV2FS", "IV3MS", "IV3FS", "IV2D", "IV2FD", "IV3MD", "IV3FD", "IV1P", "IV2MP", "IV2FP", "IV3MP", "IV3FP", "NEG_PART", "PREP", "RESULT_CLAUSE_PARTICLE", "SUBJUNC", "DET"],
            "stem": ["ABBREV", "ADJ", "ADV", "DEM_PRON_F", "DEM_PRON_FS", "DEM_PRON_FD", "DEM_PRON_MS", "DEM_PRON_MD", "DEM_PRON_MP", "INTERROG", "NO_STEM", "NOUN", "NOUN_PROP", "NUMERIC_COMMA", "PART", "PRON_1S", "PRON_2MS", "PRON_2FS", "PRON_3MS", "PRON_3FS", "PRON_2D", "PRON_3D", "PRON_1P", "PRON_2MP", "PRON_2FP", "PRON_3MP", "PRON_3FP", "REL_PRON", "VERB_IMPERATIVE", "VERB_IMPERFECT", "VERB_PERFECT", "NO_RESULT"],
            "suffix": ["CASE_INDEF_NOM", "CASE_INDEF_ACC", "CASE_INDEF_ACCGEN", "CASE_INDEF_GEN", "CASE_DEF_NOM", "CASE_DEF_ACC", "CASE_DEF_ACCGEN", "CASE_DEF_GEN", "NSUFF_MASC_SG_ACC_INDEF", "NSUFF_FEM_SG", "NSUFF_MASC_DU_NOM", "NSUFF_MASC_DU_NOM_POSS", "NSUFF_MASC_DU_ACCGEN", "NSUFF_MASC_DU_ACCGEN_POSS", "NSUFF_FEM_DU_NOM", "NSUFF_FEM_DU_NOM_POSS", "NSUFF_FEM_DU_ACCGEN", "NSUFF_FEM_DU_ACCGEN_POSS", "NSUFF_MASC_PL_NOM", "NSUFF_MASC_PL_NOM_POSS", "NSUFF_MASC_PL_ACCGEN", "NSUFF_MASC_PL_ACCGEN_POSS", "NSUFF_FEM_PL", "POSS_PRON_1S", "POSS_PRON_2MS", "POSS_PRON_2FS", "POSS_PRON_3MS", "POSS_PRON_3FS", "POSS_PRON_2D", "POSS_PRON_3D", "POSS_PRON_1P", "POSS_PRON_2MP", "POSS_PRON_2FP", "POSS_PRON_3MP", "POSS_PRON_3FP", "IVSUFF_DO:1S", "IVSUFF_DO:2MS", "IVSUFF_DO:2FS", "IVSUFF_DO:3MS", "IVSUFF_DO:3FS", "IVSUFF_DO:2D", "IVSUFF_DO:3D", "IVSUFF_DO:1P", "IVSUFF_DO:2MP", "IVSUFF_DO:2FP", "IVSUFF_DO:3MP", "IVSUFF_DO:3FP", "IVSUFF_MOOD:I", "IVSUFF_SUBJ:2FS_MOOD:I", "IVSUFF_SUBJ:D_MOOD:I", "IVSUFF_SUBJ:3D_MOOD:I", "IVSUFF_SUBJ:MP_MOOD:I", "IVSUFF_MOOD:S", "IVSUFF_SUBJ:2FS_MOOD:SJ", "IVSUFF_SUBJ:D_MOOD:SJ", "IVSUFF_SUBJ:MP_MOOD:SJ", "IVSUFF_SUBJ:3MP_MOOD:SJ", "IVSUFF_SUBJ:3MP_MOOD:I", "IVSUFF_SUBJ:FP", "PVSUFF_DO:1S", "PVSUFF_DO:2MS", "PVSUFF_DO:2FS", "PVSUFF_DO:3MS", "PVSUFF_DO:3FS", "PVSUFF_DO:2D", "PVSUFF_DO:3D", "PVSUFF_DO:1P", "PVSUFF_DO:2MP", "PVSUFF_DO:2FP", "PVSUFF_DO:3MP", "PVSUFF_DO:3FP", "PVSUFF_SUBJ:1S", "PVSUFF_SUBJ:2MS", "PVSUFF_SUBJ:2FS", "PVSUFF_SUBJ:3MS", "PVSUFF_SUBJ:3FS", "PVSUFF_SUBJ:2MD", "PVSUFF_SUBJ:2FD", "PVSUFF_SUBJ:3MD", "PVSUFF_SUBJ:3FD", "PVSUFF_SUBJ:1P", "PVSUFF_SUBJ:2MP", "PVSUFF_SUBJ:2FP", "PVSUFF_SUBJ:3MP", "PVSUFF_SUBJ:3FP", "CVSUFF_DO:1S", "CVSUFF_DO:3MS", "CVSUFF_DO:3FS", "CVSUFF_DO:3D", "CVSUFF_DO:1P", "CVSUFF_DO:3MP", "CVSUFF_DO:3FP", "CVSUFF_SUBJ:2MS", "CVSUFF_SUBJ:2FS", "CVSUFF_SUBJ:2MP"]
        },
        bw: function(x, isGrammer) {
            var result = {};
            var match = null;

            var not = true;
            for (var i in main.allPossibleTags) {
                if (main.allPossibleTags[i].indexOf(x) >= 0) {
                    result.type = i;
                    result.pos = x;
                    not = false;
                }
            }
            //if tag is not in the tag set above!
            if (not && isGrammer)
                console.error("tag is not defined! : " + x);

            // irregular, and extract features
            if (/PV/.test(x)) {
                // result.pos = "verb";
                result.aspect = "perfective";
                result.voice = "active";
            }
            if (/PV_PASS/.test(x)) {
                // result.pos = "verb";
                result.aspect = "perfective";
                result.voice = "passive";
            }
            if (match = /PVSUFF_DO:([123]?)([MF]?)([SDP]?)/.exec(x)) {
                // result.pos = "obj";
                result.aspect = "perfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /PVSUFF_SUBJ:([123]?)([MF]?)([SDP]?)/.exec(x)) {
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

            if (/IV_PASS/.test(x)) {
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
            if (match = /IVSUFF_DO:([123]?)([MF]?)([SDP]?)/.exec(x)) {
                // result.pos = "obj";
                result.aspect = "imperfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /IVSUFF_SUBJ:([123]?)([MF]?)([SDP]?)_MOOD:(.+)/.exec(x)) {
                // result.pos = "subj";
                result.aspect = "imperfective";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
                result.mood = match[4];
            }

            if (/CV/.test(x)) {
                // result.pos = "verb";
                result.aspect = "imperative";
            }
            if (match = /CVSUFF_DO:([0-9])(.)(.)/.exec(x)) {
                // result.pos = "obj";
                result.aspect = "imperative";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }
            if (match = /CVSUFF_SUBJ:([0-9])(.)(.)/.exec(x)) {
                // result.pos = "subj";
                result.aspect = "imperative";
                result.person = match[1];
                result.gender = match[2];
                result.number = match[3];
            }

            //if (main.sub[x])
            //result.pos = main.sub[x];

            if (match = /CASE(.)(.)/.exec(x)) {
                result.state = match[1];
                result["case"] = match[2];
            }
            if (match = /NSUFF([MF])(.)(.)(.)/.exec(x)) {
                var array = match.split("_")
                for(var i in array){
                    var a = array[i];
                    if(a == "MASC")
                        result.gender = "M";
                    else if(a == "FEM")
                        result.gender = "FEM";
                    else if(a == "INDEF")
                        result["state"] = "INDEF";
                    else if(a == "ACCGEN")
                        result["case"] = "-";
                    else if(a == "NOM")
                        result["case"] = "NOM";
                    else if(a == "ACC")
                        result["case"] = "ACC";
                    else if(a == "GEN")
                        result["case"] = "GEN";
                    else if(a == "SG")
                        result.gender = "S";
                    else if(a == "DU")
                        result.gender = "D";
                    else if(a == "PL")
                        result.gender = "P";
                    else if(a == "POSS")
                        result.possesor = "POSS";

                }
                // result.gender = match[1];
                // result.number = match[2];
                // result["case"] = match[3];
                // result.possesor = match[4];
            }

            return result;
        },
        processJava: function(data, callback) {
            var result = {
                analyses: [],
                orig: JSON.stringify(data, null, 1)
            };
            if (data == ""){
                console.error("callback null");
                return callback(null);
            }
            result.wutf8 = data.token;
            result.wbw = data.Transliteration;

            var analyses = data.sol;
            for (var i in analyses) {
                var analysis = analyses[i];

                var gloss = ""
                for (var k in analysis.gloss) {
                    if (k == "stem")
                        gloss += " + " + analysis.gloss[k] + " + ";
                    else
                        gloss += analysis.gloss[k];
                }

                var r = {
                    num: analysis.count,
                    utf8: analysis.Vocalized,
                    lem: include.buckwalter.bw2utf(analysis.lemma),
                    gloss: gloss,
                    prefix: [],
                    suffix: [],
                    morphemes: [],
                    prefix_pos: [],
                    suffix_pos: [],
                };
                var prefix = {};
                var suffix = {};
                var main = {};
                for (var k in analysis.Morphology) {
                    if (k == "stem") {
                        var bwResult = main.bw(analysis.Morphology[k])
                        main.morphology = bwResult;
                        for (var y in bwResult)
                            r[y] = bwResult[y];
                    } else if (k == "prefix") {
                        prefix.morphology = analysis.Morphology[k];
                    } else if (k == "suffix") {
                        suffix.morphology = analysis.Morphology[k];
                    }
                }
                for (var k in analysis.grammer) {
                    var a = analysis.grammer[k];
                    if (k == "stem") {
                        a = a.split("\t");
                        var bwResult = main.bw(a[1], true)
                        r.stem = a[0];
                        r.morphemes.push({
                            type:"stem",
                            grammer: bwResult,
                            morphology: main.morphology,
                            pos: bwResult.pos || main.morphology,
                        });
                        for (var y in bwResult)
                            r[y] = bwResult[y];
                    } else if (k == "prefix") {
                        for (var l in a){
                            prefix.grammer = a[l].split("\t");
                            r.morphemes.push({
                                type:"prefix",
                                grammer: {
                                    utf8: prefix.grammer[0],
                                    pos: prefix.grammer[1],
                                },
                                pos: prefix.grammer[1] || prefix.morphology,
                                morphology: prefix.morphology
                            });
                        }
                    } else if (k == "suffix") {
                        for (var l in a){
                            suffix.grammer = a[l].split("\t");
                            r.morphemes.push({
                                type:"suffix",
                                grammer: {
                                    utf8: suffix.grammer[0],
                                    pos: suffix.grammer[1],
                                },
                                pos: suffix.grammer[1] || suffix.morphology,
                                morphology: suffix.morphology
                            });
                        }
                    }
                }
                r.prefix.push(prefix);
                r.suffix.push(suffix);
                if (prefix.morphology != "Pref-0")
                    r.prefix_pos.push(prefix.morphology);
                if (prefix.morphology != "Suff-0")
                    r.suffix_pos.push(suffix.morphology);
                result.analyses.push(r);
            }
            callback(null, result);
        },
        post_process: function(word) {
            var types = {
                "prefix": 0,
                "stem": 10,
                "suffix": 0,
            };
            for (var an in word.analyses) {
                var a = word.analyses[an];
                //decide which is the stem
                var theStem = null;
                var max = -9999;
                for (var k in a.morphemes) {
                    if (types[a.morphemes[k].type] >= max) {
                        max = types[a.morphemes[k].type];
                        theStem = a.morphemes[k];
                    }
                }
                var current = "prefix";
                for (var k in a.morphemes) {
                    if (a.morphemes[k] == theStem) {
                        current = "suffix";
                        for (var x in theStem)
                            if(x != "utf8")
                                a[x] = theStem[x];
                    } else {
                        a[current].push(a.morphemes[k]);
                        a[current + "_pos"].push(a.morphemes[k].pos);
                    }
                }
            }

            return word;
            // if (word.features.type == "stem") {
            //             r.stem = b.utf8;
            //             r.main.push(b);
            //         } else if (features.type == undefined) {
            //             console.error(r)
            //             console.error(result.analyses[result.analyses.length - 1])
            //         } else {
            //             r[features.type].push(b);
            //             r[features.type+"_pos"].push(b.bw);
            //         }
        },
        process: function(lines, callback) {
            var result = {
                analyses: [],
                orig: lines
            };
            //PREPROCESSING
            //var lines = lines.replace(/\t/g,",");

            //each chunk now is a seperate line!
            if (lines == "")
                return callback(null);
            var analyses = lines.split("\n  SOLUTION");
            // console.error(analyses[0].trim().split("\n"));
            result.wutf8 = include.buckwalter.bw2utf(analyses[0].trim().split("\n")[1].split(":")[1].trim());
            delete analyses[0];
            for (var i in analyses) {

                var analysis = analyses[i];
                if (!analysis)
                    continue;
                //var match = / (\d+): \((.*)\) \[(.*)\n\] ([^ ]*)\n +\(GLOSS\): (.*)/gm.exec(analysis);
                var arr = analysis.trim().split("\n");
                arr[1] = arr[1].trim();
                arr[0] = arr[0].split(" ")
                var r = {
                    num: arr[0][0].slice(0, -1),
                    roman: arr[0][1].slice(1, -1),
                    lem: include.buckwalter.bw2utf(arr[0][2].replace("_", "±").slice(1, -1)).replace("±", "_"),

                    gloss: arr[1].slice(7),
                    prefix: [],
                    main: [],
                    suffix: [],
                    prefix_pos: [],
                    suffix_pos: [],
                };

                r.utf8 = include.buckwalter.bw2utf(r.roman);

                var bw = arr[0][3];
                r.bw = bw;
                var morphemes = bw.split("+");
                r.morphemes = [];
                for (var j in morphemes) {
                    var s = morphemes[j].split("/");
                    var b = {
                        roman: s[0],
                        utf8: include.buckwalter.bw2utf(s[0]),
                        bw: s[1],
                    };
                    var features = main.bw(s[1], true);

                    for (var k in features) {
                        b[k] = features[k];
                    }

                    b.type = features.type;
                    if(b.type=="stem")
                        b.lem = r.lem
                    r.morphemes.push(b);
                };
                result.analyses.push(r);
            }
            callback(null, main.post_process(result));
        }
    }
module.exports = main