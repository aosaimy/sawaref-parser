"use strict";
var include = require('./resultsParser.include.js');
module.exports = class SWParser {
    constructor() {
        this.skipped_poses = [
            // "r---t-",
            // "r---k-",
            // "r---f-",
            // "r---a-",
            // "r---p-",
            // "r---n-",
            // //------
            // "r---m-",
            // "r---l-",
            // "r---u-",
    ]
    }
    process() {
        var that = this
        return function(data, callback) {

            data.wordpos = that.counter;
            var result = {
                orig: JSON.stringify(data),
                wutf8: data.word_str[0],
            };
            var obj = {
                prefix: [],
                suffix: [],
                prefix_pos: [],
                suffix_pos: [],
                morphemes: [],
                utf8: data.word_str[0],
            };
            for (var i in data.morpheme) {
                var m = data.morpheme[i];
                var morph = {};
                morph.utf8 = m.morph_str[0];
                var t = m.tag[0];
                morph.pos = t.substr(0, 6);
                if (that.skipped_poses.indexOf(morph.pos) >= 0) {
                    continue;
                }
                morph.fullpos = t;
                morph.aspect = t[2] == "c" ? "i" : (t[2] == "i" ? "c" : t[2]);
                morph.punc = t[5];
                morph.gender = t[6];
                morph.number = t[7];
                morph.person = t[8];
                morph.voice = t[13];
                if (t[0] == "n")
                    morph["case"] = t[10]
                else if (t[0] == "v")
                    morph.mood = t[10]

                morph.state = t[12];

                if (m.seg_kind[0] == "STEM") {
                    morph.type = "stem"
                } else if (m.seg_kind[0] == "PREF") {
                    morph.type = "prefix"
                } else if (m.seg_kind[0] == "SUFF") {
                    morph.type = "suffix"
                }
                obj.morphemes.push(include.getCleanCopy(morph));

                if (m.seg_kind[0] == "STEM") {
                    morph.type = m.seg_kind[0]
                    for (var k in morph) {
                        obj[k] = morph[k];
                    }
                } else if (m.seg_kind[0] == "PREF") {
                    obj.prefix.push(morph);
                    obj.prefix_pos.push(morph.pos);
                } else if (m.seg_kind[0] == "SUFF") {
                    obj.suffix.push(morph);
                    obj.suffix_pos.push(morph.pos);
                }
            }
            result.analyses = [obj];
            that.counter++;
            callback(null, result);
        }
    }
}