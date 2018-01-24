    Xerox: {
        process: function(data, callback) {
            var result = {
                wutf8: data["input"]["@utf8"],
                roman: data["input"]["@transliteration"],
                analyses: []
            };
            result.orig = JSON.stringify(data, null, 1);
            // console.error("@@@@@@@@@@@@@@@@",data);
            if (data["error"]){
                return callback(null, result);
            }
            if (!data["analysis-list"]["analysis"].length) {
                data["analysis-list"]["analysis"] = [data["analysis-list"]["analysis"]];
            }
            for (var j in data["analysis-list"]["analysis"]) {
                var a = data["analysis-list"]["analysis"][j];
                var analysis = {};
                analysis.utf8 = a["fullvowel-form"]["@utf8"];
                if (a["root"])
                    analysis.root = a["root"]["@utf8"];
                analysis.lexical = a["lexical"];
                var morphemes = a["lexical"].split("\n");
                analysis.morphemes = [];


                for (var i in morphemes) {
                    var tags = morphemes[i].split(" ");
                    var morphem = {};
                    for (var k in tags) {
                        var f = tags[k];
                        if (["Perfect", "Imperfect", "Imperative"].indexOf(f) >= 0) {
                            morphem.aspect = f;
                        } else if (["Verb", "Noun", "Pronoun"].indexOf(f) >= 0) {
                            morphem.pos = f;
                        } else if (["Indicative", "Subjunctive", "Jussive", "Energetic"].indexOf(f) >= 0) {
                            morphem["Mood"] = f;
                        } else if (["Active", "Passive"].indexOf(f) >= 0) {
                            morphem.voice = f;
                        } else if (["FormI", "FormII", "FormIII", "FormIV", "FormV", "FormVI", "FormVI", "FormVII", "FormVIII", "FormIX", "FormX", "FormXI", "FormXII"].indexOf(f) >= 0) {
                            morphem.verbform = f;
                        } else if (["Sing", "Plur", "Dual"].indexOf(f) >= 0) {
                            morphem.number = f;
                        } else if (["Masc", "Fem"].indexOf(f) >= 0) {
                            morphem.gender = f;
                        } else if (["1stPer", "2ndPer", "3rdPer"].indexOf(f) >= 0) {
                            morphem.person = f;
                        } else {
                            morphem[f] = true;
                        }
                    }
                    if (["Verb", "Noun"].indexOf(morphem.pos) >= 0) {
                        for (var i in morphem)
                            analysis[i] = morphem[i];
                    } else
                        analysis.morphemes.push(morphem);
                }


                var glosses = [];
                for (var i in a["glosses"]["gloss-list"]) {
                    var g = a["glosses"]["gloss-list"][i];

                    if (typeof g == "string")
                        glosses.push(g);
                    else if (Object.prototype.toString.call(g) === '[object Array]')
                        glosses.push(g.join(","));
                    else if (Object.prototype.toString.call(g["gloss"]) === '[object Array]')
                        glosses.push(g["gloss"].join(","));

                }
                analysis.gloss = glosses.join("+");
                result.analyses.push(analysis);
            }
            callback(null, result);
        }
    },
