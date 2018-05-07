"use strict";
var include = require('./resultsParser.include.js');
var config = require('./config');

module.exports = class MXParser {
    constructor() {
        this.subsitute = {
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
    process() {
        var that = this;
        return function(data, callback) {
            var result = {
                // orig: text,
                wutf8: data.word,
                id: data.id,
                choice: 0,
                analyses: [],
            };
            // if xml conversion did not make an array
            // if(!data.analysis)
            //     console.error(data)
            if (!data.analysis)
                data.analysis = []
            if(!Array.isArray(data.analysis))
                data.analysis = [data.analysis]
            for (var anal of data.analysis) {
                // console.log(anal)
                var obj = {
                    prefix: [],
                    suffix: [],
                    prefix_pos: [],
                    suffix_pos: [],
                    utf8: anal.diac,
                    bw: anal.morph_feature_set.bw,
                    score: anal.score,
                    rank: anal.rank
                };
                for (let i in anal.morph_feature_set) {
                    if (that.subsitute[i]) {
                        obj[that.subsitute[i]] = anal.morph_feature_set[i]
                    } else
                        obj[i] = anal.morph_feature_set[i]
                    if (["prc0", "prc1", "prc2", "prc3"].indexOf(i) >= 0) {
                        if (anal.morph_feature_set[i] != "0" && anal.morph_feature_set[i] != "na") {
                            obj.prefix.push(anal.morph_feature_set[i])
                            obj.prefix_pos.push(anal.morph_feature_set[i])
                        }
                    } else if (["enc0", "enc1", "enc2", "enc3"].indexOf(i) >= 0) {
                        if (anal.morph_feature_set[i] != "0" && anal.morph_feature_set[i] != "na") {
                            obj.suffix.push(anal.morph_feature_set[i])
                            obj.suffix_pos.push(anal.morph_feature_set[i])
                        }
                    }
                }
                if(obj.aspect=="c")
                    obj.mood="u"


                var copyOfObj = include.getCleanCopy(obj)
                obj.morphemes = [];

                for (let i in obj.prefix_pos) {
                    let split = obj.prefix_pos[i].split("_");
                    obj.morphemes.push({
                        type: "prefix",
                        utf8: include.buckwalter.bw2utf(split[0]),
                        pos: split[1],
                        fullpos: obj.prefix_pos[i]
                    });
                }
                var saveIndex = obj.morphemes.length;
                copyOfObj.type = "stem";
                obj.morphemes.push(copyOfObj);

                for (let i in obj.suffix_pos) {
                    let split = obj.suffix_pos[i].split("_");
                    var objj = {
                        type: "suffix",
                        // utf8:split[0],
                        // pos:split[1],
                        fullpos: obj.suffix_pos[i]
                    }
                    let type = ["poss","pron","dobj","iobj"].indexOf(split[1])
                    if (type  >= 0 ) {
                        objj.utf8 = "";
                        objj.case = type === 0 ? "g" : type == 1 ? "g" : type == 2 ? "a" : "";

                        objj.pos = split[1];

                        objj.person = split[0].replace(/[^1-3]/g, "");
                        objj.number = split[0].replace(/[^sdp]/g, "");
                        objj.gender = split[0].replace(/[^fm]/g, "");
                    } else {
                        objj.utf8 = include.buckwalter.bw2utf(split[0]);
                        objj.pos = split[1];
                    }
                    obj.morphemes.push(objj);
                }
                // console.error(obj)

                // computing morpheme utf8
                obj.morphemes[saveIndex].utf8 = include.buckwalter.bw2utf(obj.roman);
                var text = ""
                for (let i in obj.morphemes)
                    if (obj.morphemes[i].type == "prefix") text += obj.morphemes[i].utf8;
                if (obj.morphemes[saveIndex].utf8.indexOf(text) === 0) {
                    obj.morphemes[saveIndex].utf8 = obj.morphemes[saveIndex].utf8.substring(obj.morphemes[saveIndex].utf8.indexOf(text) + text.length)
                }
                text = ""
                for (let i in obj.morphemes)
                    if (obj.morphemes[i].type == "suffix") text += obj.morphemes[i].utf8;
                if (obj.morphemes[saveIndex].utf8.indexOf(text) > 0) {
                    obj.morphemes[saveIndex].utf8 = obj.morphemes[saveIndex].utf8.substring(0, obj.morphemes[saveIndex].utf8.indexOf(text))
                }

                //NEW Thing comment it if it wrong: {
                let bw_segments = anal.morph_feature_set.bw.split("+")
                                .filter((e,i,arr)=>{
                                    let s = e.split("/");
                                    if(/^IV[1-3]/.test(s[1])){
                                        arr[i+1] = s[0] + arr[i+1]
                                        return false
                                    }
                                    return true;
                                })
                                .reverse().filter((e,i,arr)=>{
                                    let s = e.split("/");
                                    if(s[1].indexOf("CASE_")===0 || 
                                    s[1].indexOf("NSUFF_")===0 || 
                                    s[1].indexOf("PVSUFF_SUBJ")===0 ){
                                        if(s[0] != "(null)")
                                            arr[i+1] = arr[i+1].replace("/",s[0]+"/")
                                        return false
                                    }
                                    return true;
                                    // return s[1].indexOf("IV")!==0;

                                }).reverse()

                if(config.useBwForUtf8 && bw_segments.length == obj.morphemes.length){
                    var utfs = bw_segments.map(e=>e.split("/")[0])
                    for (let i in obj.morphemes){
                        if(utfs[i])
                            obj.morphemes[i].utf8 = include.buckwalter.bw2utf(utfs[i])
                    }
                }
                else if(config.debug)
                    console.error(bw_segments,obj.morphemes.map(x=>x.utf8).join("+"),bw_segments.length,obj.morphemes.length);
                // }

                obj.utf8 = include.buckwalter.bw2utf(obj.roman);

                result.analyses.push(obj);
            }
            // if(result.analyses.length === 0)
            //     result.error = "Unknown Word";
            // counter++;
            callback(null, result);
        }
    }
}