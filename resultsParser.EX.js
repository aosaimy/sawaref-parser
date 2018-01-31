"use strict";
var included = require('./resultsParser.include.js');
module.exports = class EXParser {
    constructor(config) {
        this.poses = {
            "V-": 5, //"fEl",
            "VI": 8, //"mDArE",
            "VP": 8, //"mAD",
            "VC": 8, //"Omr",
            "N-": 10, //"Asm",
            "A-": 4, //"Sfp",
            "S-": 3, //"Dmyr",
            "SP": 1, //"mtSl",
            "SD": 4, //'I$Arp',
            "SR": 4, //"mwSwl",
            "Q-": 5, //"Edd",
            "QI": 5, //"",
            "QV": 5, //"",
            "QX": 5, //"",
            "QY": 5, //"",
            "QL": 5, //"",
            "QC": 5, //"",
            "QD": 5, //"",
            "QM": 5, //"",
            "D-": 4, //"Zrf",
            "P-": 3, //"Hrf jr",
            "PI": 2, //"mnSrf",
            "C-": 1, //"Hrf ETf",
            "F-": 2, //"Hrf",
            "FN": 2, //"nfy",
            "FI": 2, //"AstfhAm",
            "I-": 2, //"tEjb",
            "X-": 9, //"foreign word",
            "Y-": 9, //"acronym/unit",
            "Z-": 5, //"zero inflections",
            "G-": 5, //"graphical symbol"
        }
        this.word = null
        this.analysesCount = 0
        this.mode = "str"
        this.tmpAnalysis = {}
        this.config = config
    }
    post_process(th) {
        for (let an in this.word.analyses) {
            var a = this.word.analyses[an];
            //decide which is the stem
            var theStem = null;
            var max = -9999;
            for (let k in a.morphemes) {
                if (this.poses[a.morphemes[k].pos] >= max) {
                    max = this.poses[a.morphemes[k].pos];
                    theStem = a.morphemes[k];
                }

                //attach info from top morphemes
                for (let x in a.topmorphemes[k]) {
                    a.morphemes[k][x] = a.topmorphemes[k][x];
                }
            }
            var current = "prefix";
            for (let k in a.morphemes) {
                if (a.morphemes[k] == theStem) {
                    current = "suffix";
                    a.morphemes[k].type = "stem";
                    for (let x in theStem) {
                        if (x != "utf8")
                            a[x] = theStem[x];
                    }
                } else {
                    a.morphemes[k].type = current;
                    a[current].push(a.morphemes[k]);
                    a[current + "_pos"].push(a.morphemes[k].pos);
                }
            }

        }
        if (this.word.analyses.length === 0)
            this.word.error = "no analysis!"; // TODO test
        th.emit("data", this.word);
    }
    process() {
        var that = this
        return function(line) {
            if (line.substr(0, 4) == "::::") {
                this.mode = "::::";

                if (that.word) {
                    that.post_process(this);
                }
                that.word = {
                    wutf8: line.substr(4).trim(),
                    analyses: [],

                };
                if (included.config.keepOrig)
                    that.word.orig = ""
                return;

            } else if (line.substr(0, 4) == " :::") {
                this.mode = ":::";
            } else if (line.substr(0, 4) == "  ::") {
                this.mode = "::";
                that.analysesCount++;
                that.tmpAnalysis = { topmorphemes: [] };
            } else if (line.substr(0, 4) == "   :") {
                this.mode = ":";
                var arr = line.trim().split("\t");
                var obj = {
                    morphemes: [],
                    analysisCategory: that.analysesCount,
                    utf8: arr[5],
                    topmorphemes: that.tmpAnalysis.topmorphemes,
                    prefix: [],
                    suffix: [],
                    prefix_pos: [],
                    suffix_pos: [],
                };
                //var anal = that.word.analyses[that.word.analyses.length-1];

                that.word.analyses.push(obj);

                return undefined;
            }


            if (this.mode == "::") {
                // last morpheme
                var anal = that.tmpAnalysis.topmorphemes[that.tmpAnalysis.topmorphemes.length - 1];
                // console.log(that.tmpAnalysis.topmorphemes);

                let arr = line.replace("::", "").trim().split("\t");

                if (arr.length == 7) {
                    anal.stem = arr[6];
                    anal.stemRoot = arr[1].slice(1, -1);
                    anal.lexmePattern = arr[2];
                } else if (arr.length == 2 && arr[0][0] == "(") {
                    anal = {};
                    anal.twonum = arr[0];
                    anal.gloss = arr[1];
                    that.tmpAnalysis.topmorphemes.push(anal)
                } else {
                    // console.error(arr);
                    anal.thatPos = arr[0];
                    anal.DoNotKnow = arr[1];
                }

            } else if (this.mode == ":" && line.trim()) {
                let anal = that.word.analyses[that.word.analyses.length - 1];
                //anal = anal.anals[anal.anals.length-1];

                let arr = line.trim().split("\t");

                var p = arr[0];
                var morphem = {};
                morphem.pos = p.substr(0, 2);
                if (p[0] == "V")
                    morphem.aspect = p[1];
                //morphem.posE = that.poses[morphem.pos];
                morphem.mood = p[2];
                morphem.voice = p[3];
                morphem.idonno = p[4];
                morphem.person = p[5];
                morphem.gender = p[6];
                morphem.number = p[7];
                // var thecase = {
                //     "1": "nominative",
                //     "2": "genitive",
                //     "4": "accusative",
                //     "-": "-"
                // };
                morphem["case"] = p[8];
                morphem.state = p[9];

                // anal.utf8 += arr[7];
                morphem.structure = arr[3];
                morphem.root = arr[2].slice(1, -1);

                morphem.utf8 = arr[8];

                anal.morphemes.push(morphem);


            }
            if (that.word)
                if (included.config.keepOrig)
                    that.word.orig += line + "\n";
        }
    }
}