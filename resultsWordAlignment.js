// parser.js
// usage node JsonToCsv.js --tool byTool [--feature pos|...] [--morpheme]

// var csv_stringify = require('csv-stringify');
var argv = require('minimist')(process.argv.slice(2));
var JSONStream = require('JSONStream');
var es = require('event-stream');
var fs = require('fs');

if(!argv.raw){
    console.error("Missing: --raw sourceFile");
    process.exit(1);
}
var myapp = {
    raw : null,
    counter: 0,
    pScore: 10000,
    cScore: 10000,
    nScore: 10000,
    previousData: null,
    align: function(data) {
        if(myapp.raw === null){
            var raw = fs.readFileSync(argv.raw, "utf8");
            //remove short vowels
            myapp.raw = raw
                .replace(/[\u064b-\u065f]/g, '') // shortvowels
                // .replace(/[\u0622\u0623\u0625]/g, '\u0627') // hamza
                // .replace(/[\u0649]/g,'\u064A') // yaa
                .split(" ");

        }
        myapp.pScore = myapp.getEditDistance(myapp.raw[myapp.counter], data.wutf8);
        // if(myapp.previousData)
        //     console.log(myapp.raw[myapp.counter], "p" ,myapp.previousData.wutf8)

        // punc
        if (myapp.cScore < myapp.pScore && myapp.cScore < myapp.nScore) {
            // console.error(myapp.previousData.wutf8)
            this.emit("data", myapp.previousData);
            myapp.counter++;

            myapp.cScore = myapp.getEditDistance(myapp.raw[myapp.counter], data.wutf8);
            myapp.nScore = myapp.getEditDistance(myapp.raw[myapp.counter+1], data.wutf8);
            myapp.previousData = data;
        } else if (myapp.pScore < myapp.cScore && myapp.pScore < myapp.nScore) {
            //this.emit("data", myapp.previousData);
            // myapp.counter++;            
            myapp.cScore = myapp.pScore;
            myapp.nScore = myapp.getEditDistance(myapp.raw[myapp.counter+1], data.wutf8);
            if(myapp.previousData != null){
                // console.error("======",myapp.previousData.wutf8)
                // this.emit("data", {});
            }
            myapp.previousData = data;
        }
        else{
            //n is the closest
            myapp.counter++;          
            myapp.counter++;
            // console.error("nnnnnnnn",myapp.previousData.wutf8)
            this.emit("data", {error:"asdasd"});
            this.emit("data", myapp.previousData);            
            myapp.cScore = myapp.getEditDistance(myapp.raw[myapp.counter], data.wutf8);
            myapp.nScore = myapp.getEditDistance(myapp.raw[myapp.counter+1], data.wutf8);
            myapp.previousData = data;

        }

    },
    // Compute the edit distance between the two given strings
    getEditDistance: function(a, b) {
        if (!a || a.length === 0) return b ? b.length : 0;
        if (!b || b.length === 0) return a ? a.length : 0;

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
var r = process.stdin
    .pipe(JSONStream.parse("*"))
    .pipe(es.through(myapp.align,
            function end() { //optional
                if(myapp.previousData)
                    this.emit("data", myapp.previousData);
                // this.emit("data", myparser["MarMoT"].postprocess(null));
                this.emit('end')
            }))
    .pipe(JSONStream.stringify())
    .pipe(process.stdout);

process.stdout.on('error', process.exit);
