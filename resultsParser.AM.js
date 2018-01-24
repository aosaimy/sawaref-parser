"use strict";
var include = require('./resultsParser.include.js');
module.exports = class AMParser {
    constructor(source){
        this.savedAyah= null
        this.segments= []
        this.previousScore= 0
        this.counter= 0
        this.source = source // should be assigned from constructer
        this.cu= "prefix"
    }
    sendData() {
        var counter = this.counter;
        var segments = this.segments;

        var obj = {
            wutf8: this.savedAyah[counter],
            roman: "",
            analyses: [],
            wordpos: counter,
        };
        if(include.config.keepOrig)
            obj.orig= ""
        
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

        obj.roman = include.buckwalter.utf2bw(obj.wutf8);
        obj.analyses.push(analysis);

        return obj;
    }
    postprocess() {
        var that = this
        return function(data){
            /**
             * This is to re-unite the segmented words
             ***/

            if (!that.savedAyah) {
                var raw = that.source
                //remove short vowels
                that.savedAyah = raw
                    //.replace(/[\u064b-\u065f]/g, '') // shortvowels
                    //.replace(/[\u0622\u0623\u0625]/g, '\u0627') // hamza
                    // .replace(/[\u0649]/g,'\u064A') // yaa
                    .split(" ");
            }
            //TRICK to send the last data, by sending null as paramater
            if (data === null) {
                return that.sendData();
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
        }
    }
    process(lines, callback) {
        //PREPROCESSING
        if (lines === "")
            return callback(null);

        var result = {
            orig: lines,
        };
        var word = lines.trim();

        var re = /^(.*?)\/(.*)$/;
        var matches = re.exec(word);
        if (!matches) {
            console.error("no matches:" + word + "$ lines:" + lines);
            callback(null);
            return;
        }
        result.utf8 = matches[1];
        result.roman = include.buckwalter.utf2bw(result.utf8);
        var spl = matches[2].split("_");
        result.pos = spl[0];
        var t = spl[1];

        // EXTRACTING FEATURES

        for (var ch in t) {
            if (ch == "F") {
                result.gender = "female";
            } else if (ch == "M") {
                result.gender = "male";
            } else if (ch == "S") {
                result.number = "singular";
            } else if (ch == "D") {
                result.number = "dual";
            } else if (ch == "P") {
                result.number = "plural";
            } else if (ch == "3") {
                result.person = "3";
            } else if (ch == "2") {
                result.person = "2";
            } else if (ch == "1") {
                result.person = "1";
            }
        }

        t = spl[0];
        if (t == "VB")
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
