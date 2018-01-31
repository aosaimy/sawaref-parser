"use strict"
var buckwalter = require('buckwalter-transliteration');
var config = require('./config.json');
buckwalter.bw2utf = buckwalter("bw2utf")
buckwalter.utf2bw = buckwalter("utf2bw")
module.exports = {
    buckwalter: buckwalter,
	config: config,
	getCleanCopy : (obj) => {
	    var copyOfObj = JSON.parse(JSON.stringify(obj));
	    delete copyOfObj.prefix;
	    delete copyOfObj.prefix_pos;
	    delete copyOfObj.suffix;
	    delete copyOfObj.suffix_pos;
	    return copyOfObj;
	},
    // Compute the edit distance between the two given strings
    getEditDistance: function(a, b) {
            if (!a || a.length === 0) return b.length;
            if (!b || b.length === 0) return a.length;

            var matrix = [];

            // increment along the first column of each row
            var i;
            for (i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }

            // increment each column in the first row
            var j;
            for (j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }

            // Fill in the rest of the matrix
            for (i = 1; i <= b.length; i++) {
                for (j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) == a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                            Math.min(matrix[i][j - 1] + 1, // insertion
                                matrix[i - 1][j] + 1)); // deletion
                    }
                }
            }

            return matrix[b.length][a.length];
        } //http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
}
