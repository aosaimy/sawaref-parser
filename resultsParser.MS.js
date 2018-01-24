var include = require('./resultsParser.include.js');
var main =  {
        process: function(data, callback) {
            var result = {
                analyses: [],
                // dasdsa:"sadas",
            }
            result.wutf8 = data.Word;
            result.roman = buckwalter.utf2bw(result.wutf8);

            var tags = data.Tag.split("*");
            var morphemes = [];
            for (var j in tags) {
                var tokens = tags[j].split(".");
                var morpheme = {};
                morpheme.orig = tokens;
                morpheme.pos = tokens[0];
                for (var k in tokens) {
                    var f = tokens[k];
                    // if (["V", "N", "REL", "Al", "Subj", "CrdCnj", "SCnjV", "RelMaa", "Rel", "Dmorpheme"].indexOf(f) >= 0) {
                    // ;
                    // } else 
                    if (["1", "2", "3"].indexOf(f) >= 0) {
                        morpheme.person = f;
                    } else if (["Act", "Pass"].indexOf(f) >= 0) {
                        morpheme.voice = f;
                    } else if (["Ind", "Jus", "Sub", "Eng"].indexOf(f) >= 0) {
                        morpheme.mood = f;
                    } else if (["Prs", "Pst", "Imp"].indexOf(f) >= 0) {
                        morpheme.aspect = f;
                    } else if (["Plu", "Sing", "Dual"].indexOf(f) >= 0) {
                        morpheme.number = f;
                    } else if (["Masc", "Fem"].indexOf(f) >= 0) {
                        morpheme.gender = f;
                    } else if (["Nom", "Acc", "Gen"].indexOf(f) >= 0) {
                        morpheme["case"] = f;
                    } else {
                        morpheme[f] = true;
                    }
                }
                morphemes.push(morpheme);
            }
            var analysis = {
                prefix: [],
                suffix: [],
                prefix_pos: [],
                suffix_pos: [],
                morphemes: [],
                orig: JSON.stringify(data, null, 1),
            };
            // if (morphemes.length == 1) {
            //     morphemes[0].type = "STEM";
            //     for (var k in morphemes[0]) {
            //         analysis[k] = morphemes[0][k];
            //     }
            // } else {
                var hasStem = false;
                for (var m in morphemes) {
                    var f = morphemes[m].pos;
                    if (["Subj", "DObj", "Poss"].indexOf(f) >= 0) {
                        morphemes[m].type = "SUFFIX";
                        analysis.suffix.push(morphemes[m]);
                        analysis.suffix_pos.push(f);
                    } else if (["Al"].indexOf(f) >= 0 || morphemes[m].orig.length == 1) {
                        morphemes[m].type = "PREFIX";
                        analysis.prefix.push(morphemes[m]);
                        analysis.prefix_pos.push(f);
                    } else {
                        morphemes[m].type = "STEM";
                        for (var k in morphemes[m]) {
                            analysis[k] = morphemes[m][k];
                        }
                        hasStem = true;
                    }
                    analysis.morphemes.push(include.getCleanCopy(morphemes[m]));
                }
                if (!hasStem) {
                    morphemes[0].type = "STEM";
                    for (var k in morphemes[0]) {
                        analysis[k] = morphemes[0][k];
                    }

                }
            // }
            result.analyses = [analysis];

            callback(null, result);
        },
        map:    {
                    "MOKHATAB":"person:2",
                    "GHA2EB":"person:3",
                    "MOTAKALLEM":"person:1",

                    "MA3LOOM":"voice:a",
                    "MAGHOOL":"voice:p",
                    "MA3LOOM_MAGHOOL":"voice:na",

                    "MOGARRAD":"aug:false",
                    "MAZEED":"aug:true",


                    "MADI":"aspect:PERF",
                    "MODARE3":"aspect:IMPF",
                    "AMR":"aspect:IMPV",
                    
                    "MO2ANATH":"gender:f",
                    "TA2NEETH":"gender:f",
                    "MOTHAKKAR":"gender:m",

                    "TATHNEYA":"number:d",
                    "GAM3":"number:p",
                    "TAKSEER":"number:p",
                    "MOTAKALEMEEN":"number:p",
        },
        processSarf: function(data, callback) {
            var finalResult = {
                orig: JSON.stringify(data, null, 1),
                analyses: [],
            }
            // console.error(data);
            finalResult.wutf8 = "";
            finalResult.roman = "";

            // var tags = data.Tag.split("*");
            var morphemes = [];

            if(data.sarferror){
                finalResult.error = data.sarferror.error;
                return callback(null,finalResult);
            }

            //Sarf
            for (var k in data.sarf) {
                var analysis = data.sarf[k];

                if(!finalResult.wutf8){
                    finalResult.wutf8 = analysis.DiacToken.replace(/[\u064b-\u065f]/g, '');
                    finalResult.roman = buckwalter.utf2bw(finalResult.wutf8);
                }
                //copy all syntax features to analysis
                var result = {
                    prefix: [],
                    suffix: [],
                    morphemes: [],
                    prefix_pos: [],
                    suffix_pos: [],
                };
                var main = {}
                // for (var i in obj)
                //     main[i] = obj[i];
                //



                for (var i in analysis) {
                    if (i == "DiacToken")
                        main.utf8 = analysis[i];
                    else if (i.indexOf("Prefix") == 0) {
                        if (analysis[i] != "PREFIX_NULL") {
                            result.prefix.push(analysis[i]);
                            result.prefix_pos.push(analysis[i]);
                            result.morphemes.push({
                                pos: analysis[i]
                            });
                        }
                    } else if (i.indexOf("Suffix") == 0) {
                        if (analysis[i] != "SUFFIX_NULL") {
                            result.suffix.push(analysis[i]);
                            result.suffix_pos.push(analysis[i]);
                        }
                    } else if (i == "IsDefinitiveAL")
                        main.state = analysis[i] ? "DEF" : "INDEF";
                    else
                        main[i.toLowerCase()] = analysis[i];
                }
                result.morphemes.push(include.getCleanCopy(main));
                for(var i in result.suffix_pos)
                    result.morphemes.push({
                        pos: result.suffix_pos[i]
                    });
                for(var i in result.morphemes){
                    var pos = result.morphemes[i].pos
                    for(var j in main.map){
                        if(pos.indexOf(j)>=0){
                            var s = main.map[j].split(":")
                            result.morphemes[i][s[0]] = s[1];
                        }
                    }

                }
                for (var i in main)
                    result[i] = main[i]
                finalResult.analyses.push(result);
            }
            callback(null, finalResult);
        }
    },
module.exports = main