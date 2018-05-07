"use strict";
var include = require('./resultsParser.include.js');
module.exports = class STParser {
    constructor(source) {

        this.savedAyah = null
        this.segments = []
        this.previousScore = 0
        this.counter = 0
        this.source = source
        this.poses = {
            "NN": 8,
            "NNS": 8,
            "NNP": 9,
            "NNPS": 9,
            "PRP": 3,
            "PRP$": 3,
            "WP": 5,
            "JJ": 7,
            "RB": 6,
            "WRB": 6,
            "CD": 8,
            "FW": 9,

            "CC": 1,
            "DT": 1,
            "RP": 3,
            "IN": 2, //preposition

            "VBP": 8,
            "VBN": 8,
            "VBD": 8,
            "VB": 8,

            "UH": 5,
            "PUNC": 1,
            "NUMERIC_COMMA": 1,
            "NO_FUNC": 1,
        }
    }
    sendData() {
        var counter = this.counter;
        var segments = this.segments;

        if (segments.length === 0)
            return null;

        var obj = {
            wutf8: this.savedAyah[counter],
            orig: "",
            roman: "",
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
            if(include.config.keepOrig)
                obj.orig += JSON.stringify(segments[i]);
            if (segments[i].utf8.charAt(segments[i].utf8.length - 1) == "#") {
                segments[i].utf8 = segments[i].utf8.substr(0, segments[i].utf8.length - 1);
                let current = segments[i].type = "prefix";

                analysis[current].push(segments[i]);
                analysis[current + "_pos"].push(segments[i].pos);
            } else if (segments[i].utf8.charAt(0) == "+") {
                segments[i].utf8 = segments[i].utf8.substr(1, segments[i].utf8.length);
                let current = segments[i].type = "suffix";

                analysis[current].push(segments[i]);
                analysis[current + "_pos"].push(segments[i].pos);
            } else {
                segments[i].type = "stem";
                for (var x in segments[i])
                    analysis[x] = segments[i][x];
            }
            analysis.morphemes.push(include.getCleanCopy(segments[i]));
        }
        // for (let i in segments) {
        //     analysis.utf8 += segments[i].wutf8;
        //     obj.orig += JSON.stringify(segments[i]);
        // }

        // //to decide which is the stem
        // var theStem = null;
        // var max = -9999;
        // for (let k in segments) {
        //     segments[k] = segments[k].analyses[0];
        // }
        // for (let k in segments) {
        //     let t = segments[k].pos;
        //     if (t[0] == "D" && t[1] == "T") {
        //         t = t.slice(2);
        //     }
        //     if (this.poses[t] >= max) {
        //         max = this.poses[t];
        //         theStem = segments[k];
        //     }
        // }
        // // should be impossible though
        // if (!theStem)
        //     theStem = segments[0];

        // // mark each with its type, once reach the stem change to suffix.
        // var current = "prefix";
        // for (let k in segments) {
        //     // NORMALIZING.. if DT???? prefix of DET
        //     let t = segments[k].pos;
        //     if (t != "DT" && t[0] == "D" && t[1] == "T") {
        //         analysis.prefix.push({
        //             pos: "DT"
        //         });
        //         analysis.prefix_pos.push("DT");
        //         analysis.morphemes.push({
        //             pos: "DT",
        //             utf8: "ال",
        //             type: "prefix"
        //         });
        //         segments[k].pos = segments[k].pos.slice(2);
        //     }
        //     if (segments[k] == theStem) {
        //         segments[k].type = "stem";
        //         current = "suffix";
        //         for (let x in theStem)
        //             analysis[x] = theStem[x];
        //     } else {
        //         segments[k].type = current;
        //         analysis[current].push(segments[k]);
        //         analysis[current + "_pos"].push(segments[k].pos);
        //     }
        //     analysis.morphemes.push(include.getCleanCopy(segments[k]));
        // }
        obj.roman = include.buckwalter.utf2bw(obj.wutf8);
        obj.analyses.push(analysis);

        return obj;
    }
    postprocess() {
        var that = this
        return function(data) {

            /**
             * This is to re-unite the segmented words
             ***/
            var th = that;
            if (!th.savedAyah) {
                var raw = that.source
                //remove short vowels
                th.savedAyah = raw
                    // .replace(/[\u064b-\u065f]/g, '') // shortvowels
                    // .replace(/[\u0622\u0623\u0625]/g, '\u0627') // hamza
                    // .replace(/[\u0649]/g,'\u064A') // yaa
                    .split(" ");
            }
            //TRICK to send the last data, by sending null as paramater
            if (data === null) {
                return th.sendData();
            }



            if (data.utf8.charAt(data.utf8.length - 1) == "#") {
                if (that.cu == "suffix" || that.cu == "stem") {
                    //console.error(that.sendData())
                    this.emit("data", that.sendData());
                    that.segments = [];
                    that.counter++;
                }

                that.segments.push(data);
                that.cu = "prefix";
            } else if (data.utf8.charAt(0) == "+") {

                that.segments.push(data);
                that.cu = "suffix";
            } else {
                if (that.cu == "suffix" || that.cu == "stem") {
                    this.emit("data", that.sendData());
                    that.segments = [];
                    that.counter++;
                }
                that.segments.push(data);
                that.cu = "stem";
            }

            // var text = "";
            // var segments = th.segments;
            // for (let i in segments) {
            //     text += segments[i].wutf8;
            // }
            // // console.error(data)
            // text += data.wutf8;
            // var currentScore = include.getEditDistance(th.savedAyah[th.counter], text);

            // if (th.previousScore < currentScore) {
            //     var res = th.sendData();
            //     if (res) {
            //         this.emit("data", res);
            //         th.segments = [];
            //         th.counter++;
            //     }
            //     th.previousScore = include.getEditDistance(th.savedAyah[th.counter], data.wutf8);
            // } else {
            //     th.previousScore = currentScore;
            // }
            // th.segments.push(data);
        }
    }
    process(lines, callback) {
        //PREPROCESSING
        if (lines === "")
            return callback(null);

        var result = {
            orig: lines,
            // analyses: [{}]
        };
        var word = lines.trim();

        var re = /^(.*?)\/(.*)$/;
        var matches = re.exec(word);
        if (!matches) {
            console.error("no matches:" + word + "$ lines:" + lines);
            callback(null);
            return;
        }
        result.utf8 = result.utf8 = matches[1];
        result.roman = result.roman = include.buckwalter.utf2bw(result.wutf8);
        var t = result.pos = matches[2];

        // EXTRACTING FEATURES
        if (t == "NNS")
            result.number = "plural";
        else if (t == "NN")
            result.number = "singular";
        else if (t == "NNP")
            result.number = "singular";
        else if (t == "NNPS")
            result.number = "plural";
        else if (t == "VB")
            result.aspect = "imperative";
        else if (t == "VBD") {
            result.voice = "active";
            result.aspect = "perfect";
        } else if (t == "VBN")
            result.voice = "passive";
        else if (t == "VBP") {
            result.voice = "active";
            result.aspect = "imperfect";
        }


        //POSTPROCESSING

        callback(null, result);
    }
}