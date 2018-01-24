"use strict";
var include = require('./resultsParser.include.js');
module.exports = class MDParser {
    constructor(tool){
        this.tool= tool; // MA or MD or AL
        this.subsitute= {
            "vox": "voice",
            "gen": "gender",
            "asp": "aspect",
            "mod": "mood",
            "num": "number",
            "stt": "state",
            "cas": "case",
            "per": "person",
            "diac": "roman",
            "lex": "lem",
            "stem": "stem"
        }
    }
    process(){
        var that = this
        return function(lines, callback){
            // the final result of one word
            var result = {
                analyses: [],
                orig: lines
            };
            //PREPROCESSING
            //var lines = lines.replace(/\t/g,",");

            //each chunk now is a seperate line!
            var analyses = lines.split("\n");
            if (lines === "")
                return callback(null);
            for (var i in analyses) {
                var analysis = analyses[i];

                //chech headers, if not needed ignore it.
                var header = 0
                if ((header = analysis.indexOf(";;; SENTENCE")) === 0) {
                    continue;
                } else if ((header = analysis.indexOf(";;WORD")) === 0) {
                    result.roman = analysis.substr(6).trim();
                    result.wutf8 = include.buckwalter.bw2utf(result.roman);
                    continue;
                } else if ((header = analysis.indexOf("SENTENCE BREAK")) === 0) {
                    continue;
                } else if (analysis === "") {
                    continue;
                } else if ((header = analysis.indexOf("--------------")) === 0) {
                    continue;
                } else if ((header = analysis.indexOf("NO-ANALYSIS")) === 0) {
                    result.error = "NO-ANALYSIS";
                    continue;
                } else if ((header = analysis.indexOf(";;")) === 0) {
                    continue;
                }


                var tokens = analysis.split(" ");

                //TODO change it to simple split
                var re = /^(.*?):(.*)$/;
                var obj = {
                    prefix: [],
                    suffix: [],
                    prefix_pos: [],
                    suffix_pos: [],
                };

                var j = that.tool != "AL" ? 1 : 0
                //special handling for ALMIORGEANA, no probabilities
                if (that.tool != "AL")
                    obj.prob = tokens[0];

                // for each pair value. 
                for (; j < tokens.length; j++) {
                    var matches = re.exec(tokens[j]);
                    if (!matches) {
                        console.error("no matches:" + tokens[j] + " from:" + analysis);
                        continue;
                    }

                    //rename the feature name from the list above

                    var index =  !that.subsitute[matches[1]] ? matches[1] : that.subsitute[matches[1]];

                    // stem and lem should be in UTF8 (only for MADA not MADAMIRA)
                    // TODO change the config and delete that
                    if ((that.tool == "Mada" || that.tool == "AL") && (index == "stem" || index == "lem"))
                        matches[2] = include.buckwalter.bw2utf(matches[2].replace("_", "±")).replace("±", "_");

                    // prefixes and suffixes need to be in the array.
                    if (["prc0", "prc1", "prc2", "prc3"].indexOf(index) >= 0) {
                        if (matches[2] != "0" && matches[2] != "na") {
                            obj.prefix.push(matches[2])
                            obj.prefix_pos.push(matches[2])
                        }
                    } else if (["enc0", "enc1", "enc2", "enc3"].indexOf(index) >= 0) {
                        if (matches[2] != "0" && matches[2] != "na") {
                            obj.suffix.push(matches[2])
                            obj.suffix_pos.push(matches[2])
                        }
                    } else
                        obj[index] = matches[2];
                }
                var copyOfObj = include.getCleanCopy(obj)
                obj.morphemes = [] ;

                for (let i in obj.prefix_pos) {
                    let split = obj.prefix_pos[i].split("_");
                    obj.morphemes.push({
                        type: "prefix",
                        utf8:include.buckwalter.bw2utf(split[0]),
                        pos:split[1],
                        fullpos:obj.prefix_pos[i]
                    });
                }
                var saveIndex = obj.morphemes.length;
                copyOfObj.type="stem";
                obj.morphemes.push(copyOfObj);

                for (let i in obj.suffix_pos) {
                    let split = obj.suffix_pos[i].split("_");
                    if(split[1] == "poss" || split[1] == "pron" || split[1] == "dobj" || split[1] == "iobj"){
                        split[0] = "";
                        split[1] = obj.suffix_pos[i];
                    }else{
                        split[0] = include.buckwalter.bw2utf(split[0]);
                    }
                    obj.morphemes.push({
                        type: "suffix",
                        utf8:split[0],
                        pos:split[1],
                        fullpos: obj.suffix_pos[i]
                    });
                }
                // console.error(obj)

                // computing morpheme utf8
                obj.morphemes[saveIndex].utf8 = include.buckwalter.bw2utf(obj.roman);
                var text = ""
                for(let i in obj.morphemes)
                    if(obj.morphemes[i].type == "prefix") text += obj.morphemes[i].utf8;
                if( obj.morphemes[saveIndex].utf8.indexOf(text) === 0){
                    obj.morphemes[saveIndex].utf8 = obj.morphemes[saveIndex].utf8.substring(obj.morphemes[saveIndex].utf8.indexOf(text)+text.length)
                }
                text = ""
                for(let i in obj.morphemes)
                    if(obj.morphemes[i].type == "suffix") text += obj.morphemes[i].utf8;
                if( obj.morphemes[saveIndex].utf8.indexOf(text) > 0){
                    obj.morphemes[saveIndex].utf8 = obj.morphemes[saveIndex].utf8.substring(0,obj.morphemes[saveIndex].utf8.indexOf(text))
                }
                obj.utf8 = include.buckwalter.bw2utf(obj.roman);
                result.analyses.push(obj);
            }
            // console.error(obj.utf8);
            if (!result.error && result.analyses.length === 0 && result.word === undefined) {
                callback(null);
            } else
                callback(null, result);
        }
    }
}