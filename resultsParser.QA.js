"use strict";
var include = require('./resultsParser.include.js');
module.exports = class QAParser {
    constructor(source) {
        this.savedWordPos = null
        this.savedWord = null
        this.savedAyah = null
        this.savedWordPos = 1;
        this.savedWord = {
            prefix: [],
            suffix: [],
            morphemes: [],
            prefix_pos: [],
            suffix_pos: [],
            wutf8: "",
        };
        this.source = source
        this.counter = 0;
    }
    process4() {
        // let that = this;
        return function(word) {
            var next_char = word.ayah[word.wordpos + 1] ? word.ayah[word.wordpos + 1][0] : "";
            word.analyses.forEach(an => {
                var utf8 = ""
                if (word.name + ":" + word.wordpos == "41:44:8") {
                    an.morphemes[0].utf8 = "أَ"
                    an.morphemes[1].utf8 = "أَعْجَمِيٌّ"
                    utf8 = an.morphemes.map(m => m.utf8)
                } else if (word.name + ":" + word.wordpos == "26:176:2" ||
                    word.name + ":" + word.wordpos == "26:176:4") {
                    an.morphemes[0].utf8 = "الْ"
                    an.morphemes[1].utf8 = "أَيْكَةِ"

                    utf8 = an.morphemes.map(m => m.utf8)
                } else
                    utf8 = an.morphemes.map((morph, i, arr) => {
                        //utf9 is quran script :)
                        arr[i].utf9 = morph.utf8
                        arr[i].ayah = [-2, -1, 0, 1, 2].map(x => word.ayah[word.wordpos + x]).join(" ").trim()
                        // if(["ذَٰلِكَ"].indexOf(morph.utf8)>0)
                        //pos processing

                        if (an.morphemes.length == 1) {
                            morph.utf8 = word.ayah[word.wordpos]
                            return morph.utf8
                        }
                        var tmp = -100
                        var before = an.morphemes.filter((m, j) => j < i)
                            .map(m => m.utf8).join("");
                        var after = an.morphemes.filter((m, j) => j > i)
                            .map(m => m.utf8).join("")
                        if (word.ayah[word.wordpos].indexOf(before) === 0 &&
                            (tmp = word.ayah[word.wordpos].lastIndexOf(after)) >= 0 &&
                            tmp + after.length == word.ayah[word.wordpos].length) {
                            morph.utf8 = word.ayah[word.wordpos].substr(0, tmp).substr(before.length)
                            return morph.utf8
                        }



                        if (an.morphemes.length - 1 == i)
                            morph.utf8 = morph.utf8 + " " + next_char
                        else
                            morph.utf8 = morph.utf8 + " " + an.morphemes[i + 1].utf8
                        morph.utf8 = morph.utf8
                            //special words
                            .replace(/ذَٰلِك/g, "ذَلِك")
                            .replace(/لَٰكِن/g, "لَكِن")
                            .replace(/أُو۟لَٰٓئِكَ/g, "أُولَئِكَ")
                            .replace(/هَٰذَ/g, "هَذَ")
                            .replace(/مِيكَىٰلَ/g, "مِيكَالَ")
                            .replace(/^وٓا /g, "وا")
                            //beggining of surah
                            .replace(/([لمحكهعص])ٓ/g, "$1")
                            //hamzat
                            .replace(/^ءَ ا\u0653/g, " ") // AlaAn
                            .replace(/ءَ ا/g, "آ ") // tabawaa 
                            .replace(/^ءَ /g, "أَ ") // aAntm
                            .replace(/ِء/g, "ِئ")
                            .replace(/ـَٔ[اٰ]/g, "آ")
                            .replace(/ـٔ([َُِ])/g, "ئ$1")

                            // special character in quran
                            .replace(/ا۟/g, "ا")
                            .replace(/ٱ/g, "ا")
                            .replace(/ا۠/g, "ا")
                            .replace(/ُوْ/g, "ُو")

                            //yaa
                            .replace(/^ى /g, "ي ")
                            .replace(/^ىٓ /g, "ي ")
                            .replace(/ىَ/g, "يَ")
                            .replace(/ىْ/g, "يْ")
                            .replace(/ِى/g, "ِي")

                            .replace(/يَٰٓ/g, "يَا")
                            .replace(/ىٰ/g, "ى")
                            .replace(/ۥٓ/g, "")
                            .replace(/َٰ/g, "َا")
                            .replace(/وٰ/g, "ا")
                            .replace(/ءَا/g, "آ")

                            // shaddah before harakah
                            .replace(/([ًٍَُُِ])ّ/g, "ّ$1")

                            //madd
                            .replace(/هِۦٓ? /g, "هِ ")
                            .replace(/([واىۦۥ])ٓ([أءإئآ])/g, "$1$2")
                            .replace(/([واىۦۥ])ٓ ([أءإئآ])/g, "$1 $2")
                            .replace(/([واىۦۥ])ٓ(.ّ)/g, "$1$2")
                            .replace(/وٓا ([أءإئآ])/g, "وا $2")
                            .replace(/ىٰٓ ([أءإئآ])/g, "ى $1")
                            .replace(/يٓ/g, "ي")
                            .replace(/وٓ/g, "و")

                            .replace(/[ۢ]/g, "")
                            .replace(/[ۦۥ] /g, " ")
                            .replace(/ۦ/g, "ي")
                            .replace(/ۥ/g, "و")

                            //skoon when none/meem sakina
                            .replace(/م [بم]/g, "مْ ")
                            .replace(/ن [بيرملونصذثكجشقسدطزفتضظ]/g, "نْ ")
                            .replace(/م([بم])/g, "مْ$1")
                            .replace(/ن([بيرملونصذثكجشقسدطزفتضظ])/g, "نْ$1")
                            .replace(/ل ل/g, "لْ ل")
                            .replace(/ت ت/g, "تْ ت")

                        if (0 === i)
                            morph.utf8 = morph.utf8
                            .replace(/^(.)ّ/g, "$1")

                        if (an.morphemes.length - 1 == i)
                            morph.utf8 = morph.utf8
                            .replace(/ِى /g, "ِي ")

                        if (an.morphemes.length - 1 != i)
                            morph.utf8 = morph.utf8
                            .replace(/ى/g, "ا")
                        morph.utf8 = morph.utf8
                            .replace(/ .*/, "")
                        arr[i].utf8 = morph.utf8
                        return morph.utf8
                    }).join("")
                if (utf8 != word.ayah[word.wordpos]) {
                    utf8 = an.morphemes.map((morph, i, arr) => {

                        // if(false) // debugging
                        //     console.error("Diff",
                        //         [before, morph.utf8,after].join("+"),
                        //         word.ayah[word.wordpos].indexOf(before) == 0,
                        //         (tmp = word.ayah[word.wordpos].lastIndexOf(after)) >= 0,
                        //         tmp,
                        //         tmp+after.length == word.ayah[word.wordpos].length,
                        //         tmp+after.length,
                        //         word.ayah[word.wordpos].length
                        //     )

                        var tmp = -100
                        var before = an.morphemes.filter((m, j) => j < i)
                            .map(m => m.utf8).join("");
                        var after = an.morphemes.filter((m, j) => j > i)
                            .map(m => m.utf8).join("")
                        if (word.ayah[word.wordpos].indexOf(before) === 0 &&
                            (tmp = word.ayah[word.wordpos].lastIndexOf(after)) >= 0 &&
                            tmp + after.length == word.ayah[word.wordpos].length) {
                            morph.utf8 = word.ayah[word.wordpos].substr(0, tmp).substr(before.length)
                            return morph.utf8
                        }
                        arr[i].utf8 = morph.utf8
                        return morph.utf8
                    }).join("")
                    if (utf8 != word.ayah[word.wordpos]) {
                        console.error("Diff in Quran Script2",
                            word.name + ":" + word.wordpos,
                            "combining result=", utf8,
                            "original in source=", word.ayah[word.wordpos],
                            "combining result with plus=", an.morphemes.map(m => m.utf8).join("+"),
                            "combining result of othmani with plus=", an.morphemes.map(m => m.utf9).join("+"), next_char
                            // ,an.morphemes.map(m=>m.utf10).join("") == word.ayah[word.wordpos]
                            // ,an.morphemes.map(m=>m.utf10).join("")
                            // ,word.ayah[word.wordpos]
                        )
                        // process.exit(-1)
                    }


                }
            })
            delete word.ayah;
            this.emit("data", word)
        }
    }
    process3() {
        let that = this
        return function(data) {
            if (!that.savedAyah) {
                // var raw = fs.readFileSync("/morpho/quran/" + data.chapter + "-" + data.verse, "utf8");
                var raw = that.source;
                that.savedAyah = raw.trim().split(/[ \n]/);
            }
            data.wordpos = that.counter;
            var dist1 = include.getEditDistance(that.savedAyah[that.counter], data.wutf8);
            var dist2 = include.getEditDistance(that.savedAyah[that.counter] + that.savedAyah[that.counter + 1], data.wutf8);
            if (dist1 > dist2) {

                if (data.prefix.length == 1) {
                    let newWord = data.prefix[0];
                    data.prefix = [];
                    data.prefix_pos = [];

                    newWord.morphemes = [data.morphemes[0]];
                    data.morphemes.splice(0, 1);

                    newWord.wordpos = that.counter;
                    data.wutf8 = data.utf8;
                    newWord.prefix = newWord.suffix = newWord.prefix_pos = newWord.suffix_pos = [];
                    newWord.type = "STEM";
                    that.counter++;
                    data.wordpos = that.counter;
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: newWord.wordpos,
                        ayah: that.savedAyah,
                        wutf8: newWord.utf8,
                        analyses: [newWord]
                    });
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: data.wordpos,
                        ayah: that.savedAyah,
                        wutf8: data.wutf8,
                        analyses: [data]
                    });

                    // very temporary!!!! BE careful
                } else if (data.prefix.length == 2) {
                    let newWord = data.prefix[1];
                    data.prefix = [];
                    data.prefix_pos = [];

                    newWord.morphemes = [data.morphemes[0], data.morphemes[1]];
                    data.morphemes.splice(0, 2);

                    newWord.wordpos = that.counter;
                    data.wutf8 = data.utf8;

                    newWord.prefix = [data.morphemes[0]]
                    newWord.prefix_pos = [data.morphemes[0].pos]
                    newWord.suffix = newWord.suffix_pos = [];
                    newWord.type = "STEM";

                    that.counter++;
                    data.wordpos = that.counter;
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: newWord.wordpos,
                        ayah: that.savedAyah,
                        wutf8: newWord.utf8,
                        analyses: [newWord]
                    });
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: data.wordpos,
                        ayah: that.savedAyah,
                        wutf8: data.wutf8,
                        analyses: [data]
                    });
                } else if (data.suffix.length == 1) {
                    let newWord = data.suffix[0];
                    data.suffix = [];
                    data.suffix_pos = [];

                    newWord.morphemes = [data.morphemes[data.morphemes.length - 1]];
                    data.morphemes.splice(data.morphemes.length - 1, 1);

                    newWord.wutf8 = newWord.utf8;
                    newWord.prefix = newWord.suffix = newWord.prefix_pos = newWord.suffix_pos = [];
                    data.wutf8 = data.utf8;
                    newWord.type = "STEM";
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: data.wordpos,
                        ayah: that.savedAyah,
                        wutf8: data.wutf8,
                        analyses: [data]
                    });
                    that.counter++;
                    newWord.wordpos = that.counter;
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: newWord.wordpos,
                        ayah: that.savedAyah,
                        wutf8: newWord.utf8,
                        analyses: [newWord]
                    });
                } else {
                    this.emit("data", {
                        name: data.chapter + ":" + data.verse,
                        wordpos: data.wordpos,
                        ayah: that.savedAyah,
                        wutf8: data.wutf8,
                        analyses: [data]
                    });
                    console.error("NOT FIXED!: ", that.savedAyah[data.wordpos - 1], "   +   ", that.savedAyah[data.wordpos - 1 + 1]);
                }

            } else
                this.emit("data", {
                    name: data.chapter + ":" + data.verse,
                    wordpos: data.wordpos,
                    ayah: that.savedAyah,
                    wutf8: data.wutf8,
                    analyses: [data]
                });
            that.counter++;
        }
    }
    process2() {
        let that = this
        return function(theWord) {

        // this function is to process the prefixes and suffixes and put them in their lists
        var toReturn = null;
        if (theWord.wordpos != that.savedWordPos) {
            toReturn = that.savedWord;
            that.savedWord = {
                prefix: [],
                suffix: [],
                prefix_pos: [],
                suffix_pos: [],
                morphemes: [],
                wutf8: "",
            };
        }
        that.savedWord.morphemes.push(include.getCleanCopy(theWord));
        if (theWord.type == "STEM") {
            if (!that.savedWord.type) {
                that.savedWord.wutf8 = that.savedWord.wutf8 + theWord.utf8;
                //extend
                for (var k in theWord) {
                    that.savedWord[k] = theWord[k];
                }
            } else {
                // console.error("TWO STEMS:", that.savedWord, theWord);
                theWord.type = "PREFIX";
            }
        }

        if (theWord.type == "PREFIX") {
            that.savedWord.prefix.push(theWord);
            that.savedWord.prefix_pos.push(theWord.pos);
            that.savedWord.orig = theWord.orig + (that.savedWord.orig !== undefined ? that.savedWord.orig : "");
            that.savedWord.wutf8 = that.savedWord.wutf8 + theWord.utf8;
        } else if (theWord.type == "SUFFIX") {
            that.savedWord.suffix.push(theWord);
            that.savedWord.suffix_pos.push(theWord.pos);
            that.savedWord.orig = that.savedWord.orig + theWord.orig;
            that.savedWord.wutf8 = that.savedWord.wutf8 + theWord.utf8;
        } else if (theWord.type != "STEM") {
            console.error("undefined type", theWord.type);
        }
        that.savedWordPos = theWord.wordpos;
        if (toReturn)
            this.emit('data', toReturn);
    }
}
    process(lines, callback) {
        if (lines.trim() === "")
            return callback(null);
        var data = lines.split("\t");

        var qr = data[0].slice(1, -1).split(":");

        var result = {
            chapter: qr[0],
            verse: qr[1],
            wordpos: qr[2],
            QAwordpos: parseInt(qr[2]),
            morphem: qr[3],
            pos: data[2],
            orig: lines
        };
        if (!data[2]) {
            console.error("source file is not proper QAC-encoded file.", data, lines)
            process.exit(1)
        }
        result.roman = data[1].trim();
        result.utf8 = include.buckwalter.bw2utf_extended(result.roman);
        var features = data[3].split("|");
        result.type = features[0];
        for (var i in features) {
            var f = features[i];
            if (["PERF", "IMPF", "IMPV"].indexOf(f) >= 0) {
                result.aspect = f;
            } else if (["DEF", "INDEF"].indexOf(f) >= 0) {
                result.state = f;
            } else if (["IND", "SUBJ", "JUS", "ENG"].indexOf(f) >= 0) {
                result.Mood = f;
            } else if (["ACT", "PASS"].indexOf(f) >= 0) {
                result.voice = f;
                //TODO add parantheses to each one in the following list
            } else if (["I", "II", "III", "IV", "V", "VI", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].indexOf(f) >= 0) {
                result.verbform = f;
            } else if (["ACT PCPL", "PASS PCPL", "VN"].indexOf(f) >= 0) {
                result.derivation = f;
            } else if (["NOM", "ACC", "GEN"].indexOf(f) >= 0) {
                result["case"] = f;
            } else if (result.type == "PREFIX" && f.substr(-1) == "+") // last character is +
            {
                result.prefix = f.slice(0, -1);
            } else if (result.type == "SUFFIX" && f.substr(0, 1) == "+") // first character is +
            {
                result.suffix = f.substr(-1);
            } else if (f.length <= 3) {
                for (var j in f) { // for each character
                    if (['1', '2', '3'].indexOf(f[j]) >= 0)
                        result.person = f[j];
                    else if (['M', 'F'].indexOf(f[j]) >= 0)
                        result.gender = f[j];
                    else if (['S', 'D', 'P'].indexOf(f[j]) >= 0)
                        result.number = f[j];
                }
            } else {
                var o = f.split(":");
                if (["POS", "STEM", "PREFIX", "SUFFIX"].indexOf(o[0]) < 0) { // else ignore
                    if (o[1]) {
                        if (o[0] == "ROOT" || o[0] == "LEM")
                            result[o[0].toLowerCase()] = include.buckwalter.bw2utf(o[1]);
                        else
                            result[o[0].toLowerCase()] = o[1];
                    } else {
                        result[o[0]] = true;
                    }
                }
            }
        }

        callback(null, result);
    }
}