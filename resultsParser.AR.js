var include = require('./resultsParser.include.js');
var main =  {
        poses: {
            "verb": 10,
            "noun": 10,
            "part": 5,
            "adj": 8,
            "adv": 8,
            "art": 1,
            "comp": 5,
            "advprep": 5,
            "det": 3,
            "pron": 4,
            "conj": 3,
            "prep": 5,
        },
        process: function(lines, callback) {
            var result = {
                analyses: [],
                orig: lines,
            };
            //PREPROCESSING
            //hash instead of @
            var lines = lines.replace(/\{(n|v)@([^@]*?)@\}/g, "\{$1#$2#\}");

            //every line is an anlaysis
            var lines = lines.split("\n");
            for (var i in lines) {
                var line = lines[i];
                if (!line)
                    continue;

                var arr = line.split("\t");
                if(arr[1] == "+?"){
                    result.error =  "Unknown word";
                    continue;
                }
                if (arr.length < 2) {
                    console.error("text should be 2 tab-seperated or more", line);
                    continue;
                }
                if (!result.wutf8) {
                    result.wutf8 = arr[0];
                    result.roman = buckwalter.utf2bw(result.wutf8);
                }
                var tokens = arr[1].split("@");
                var analysis = {
                    morphemes: []
                };
                for (var j in tokens) {
                    if (tokens[j] == "")
                        continue;

                    var features = {};
                    features.orig = tokens[j];
                    //preprocessing
                    //take out arabic character
                    var lemmaRegExp = /\{[nv]#(.*?)(_\d+)?#\}/g;
                    var arabicWord = lemmaRegExp.exec(tokens[j]);
                    if (arabicWord !== null)
                        features.lem = buckwalter.bw2utf(arabicWord[1].replace("-", ""));
                    tokens[j] = tokens[j].replace(lemmaRegExp, "");

                    var arabicFinderRegExp = /[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]+/g;
                    var arabicWord = arabicFinderRegExp.exec(tokens[j]);
                    if (arabicWord !== null)
                        features.utf8 = arabicWord[0];
                    tokens[j] = tokens[j].replace(arabicFinderRegExp, "");

                    var re2 = /\+([^\+\{]*)(\{(.*)\})?/g;
                    var afeature = null;
                    while ((afeature = re2.exec(tokens[j])) !== null) {
                        var f = /[a-zA-Z0-9]*/.exec(afeature[1])[0];
                        if (["verb", "noun", "part", "adj", "adv", "art", "comp", "advprep",
                            "det", "pron", "conj", "prep", "?"].indexOf(f) >= 0) {
                            features.pos = f;
                            features.rank = main.poses[f];
                        } else if (["card", "confirm", "demon", "dist", "name", "int", "neg", "ord",
                            "fut", "proper", "prox", "quant", "rel", "ques", ].indexOf(f) >= 0) {
                            features.subpos = f;
                            if (features.pos)
                                features.pos += "_" + f;
                            else
                                features.pos = f;
                        } else if (["organization", "place", "proper"].indexOf(f) >= 0) {
                            features.subname = f;
                        } else if (["masc", "fem", "unspec"].indexOf(f) >= 0) {
                            features.gender = f;
                        } else if (["1pers", "2pers", "3pers"].indexOf(f) >= 0) {
                            features.person = f.substr(0, 1);
                        } else if (["active", "pass"].indexOf(f) >= 0) {
                            features.voice = f;
                        } else if (["def", "idef"].indexOf(f) >= 0) {
                            features.state = f;
                        } else if (["pres", "past", "imp", "fut"].indexOf(f) >= 0) {
                            features.aspect = f;
                        } else if (["acc", "nom", "gen"].indexOf(f) >= 0) {
                            features["case"] = f;
                        } else if ("MWE" == f) {
                            features.isMultWordExpr = "yes";
                        } else if ("inhuman" == f) {
                            features.isHuman = "no";
                        } else if ("human" == f) {
                            features.isHuman = "yes";
                        } else if (["pl", "sg", "dual"].indexOf(f) >= 0) {
                            features.number = f;
                        } else if (["nom", "acc", "gen", "subAcc"].indexOf(f) >= 0) {
                            features["case"] = f;
                            // } else if (result.type == "PREFIX" && f.substr(-1) == "+") // last character is +
                            // {
                            // features.prefix = f.slice(0, -1);
                            // } else if (result.type == "SUFFIX" && f.substr(0, 1) == "+") // first character is +
                            // {
                            // features.suffix = f.substr(-1);
                        } else if (afeature[3])
                            features[f] = afeature[3];
                        else
                            if(features.pos)
                                features[f] = true;
                            else
                                features.pos = f;
                    }
                    analysis.morphemes.push(features);
                }
                var max = -999;
                var theStem = null
                for (var i in analysis.morphemes) {
                    if (analysis.morphemes[i].rank > max) {
                        max = analysis.morphemes[i].rank;
                        theStem = i;
                    }
                }
                for (var i in analysis.morphemes) {
                    if(i<theStem)
                        analysis.morphemes[i].type = "prefix"
                    else if(i==theStem)
                        analysis.morphemes[i].type = "stem"
                    else if(i>theStem)
                        analysis.morphemes[i].type = "suffix"
                }
                for (var k in analysis.morphemes[theStem]) {
                    analysis[k] = analysis.morphemes[theStem][k];
                }
                result.analyses.push(analysis);
            }
            // if (result.analyses.length == 0 && result.word == undefined) {
            //     callback(null);
            // } else
            callback(null, result);
        },
    }
module.exports = main