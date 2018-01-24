#!/usr/bin/env node
/**
This file parse the content (from the standard input) of the raw results of the tool 
and do some postprocessing as required.
*/




// var tools = [
//     "KH",
//     "AR",
//     "EX",
//     "AL",
//     "BP",
//     "BJ",
//     "MS",
//     // "QT",

//     "MT",
//     "MD",
//     "MX",
//     "MA",
//     "ST",
//     "MR",
//     "WP",
//     "AM",
//     "FA",

//     "QA",
//     "SW",
// ];

// parser.js
var buckwalter = require('./buckwalter');
var md5 = require('md5');
//var csv = require('csv-streamify');
var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var all = {}; //= JSONStream.stringify();


const chalk = require('chalk');


var myparser = {
    raw1: null,
    raw2: null,
    name: null,
    inited : false,
    init: function(argv){
        if(myparser.inited)
            return
        if(argv.tag=="all" || argv.tag=="choosed")
            myparser.choosed = JSON.parse(fs.readFileSync('/morpho/backup/chosedSolutions.json', 'utf8'));

        if(argv.tag=="all" || argv.tag=="checked")
            myparser.checked = JSON.parse(fs.readFileSync('/morpho/backup/checkedSolutions.json', 'utf8'));

        if(argv.e){
            var stringify = require('csv-stringify');
            stringifier = stringify({
                columns: ["tool", "origTAG", "destTAG", "isAmbiguious", "example"]
            })
            stringifier.pipe(fs.createWriteStream(argv.e, {
                flags: "a"
            }));
            myparser.examples = [];
        }
        myparser.name = argv.name

        if(argv.align && ["ru","sp","un","ch","st","gs"].indexOf(argv.align) < 0){
            console.error("Usage: --align [ru,sp,un,ch,st]");
            process.exit();
        }

        myparser.debug = argv.d ? true: false;

        if(argv.m == "all")
            myparser.posMapping = JSON.parse(fs.readFileSync('/morpho/mappings/tagset.json', 'utf8'));
        myparser.values.pos = myparser.posMapping || {}
    },
    keys: {
        // wrong -> correct

    },
    sawalha: {
        "mood": {
            "IND": "n",
            "SUBJ": "a",
            "JUS": "j",
            "ENG": "j",
        },
        "case": {
            "ACC": "a",
            "GEN": "g",
            "NOM": "n",
        },
        "aspect": {
            "IMPF": "c",
            "PERF": "p",
            "IMPV": "i",
        },
        "gender": {
            "M": "m",
            "F": "f",

        },
        "person": {
            "1": "f",
            "2": "s",
            "3": "t",
        },
        "number": {
            "S": "s",
            "D": "d",
            "P": "p",
        },
        "voice": {
            "ACT": "a",
            "PASS": "p",

        },
        "state": {
            "INDEF": "i",
            "DEF": "d",
        },
    },
    positions: {
        // "pos": 1,
        "mood": 11,
        "case": 11,
        "aspect": 3,
        "gender": 7,
        "person": 9,
        "number": 8,
        "voice": 14,
        "state": 13,
    },
    values: {
        // wrong -> correct
        "pos": {},
        "mood": {
            //Mada
            "i": "IND",
            "s": "SUBJ",
            "j": "JUS",
            //QA
            "ind": "IND",
            "subj": "SUBJ",
            "jus": "JUS",
            //Elixir
            "e": "ENG",
            "u": "",
            "na": "",
            "-": "",
        },
        "aspect": {
            //AraComLex
            "pres": "IMPF",
            "past": "PERF",
            "imp": "IMPV",
            //QA
            "impf": "IMPF",
            "perf": "PERF",
            "impv": "IMPV",
            //Mada, Elixir
            "i": "IMPF",
            "c": "IMPV",
            "p": "PERF",
            "na": "",
            "-": "",
            //Alkhalil, stanford
            "imperfect": "IMPF",
            "imperative": "IMPV",
            "imparative": "IMPV",
            "perfect": "PERF",
            //BW
            "imperfective": "IMPF",
            "perfective": "PERF",
            //ATKS
        },
        "gender": {
            //male
            "masc": "M",
            "m": "M",
            "male": "M",
            //female
            "fem": "F",
            "f": "F",
            "female": "F",
        },
        "person": {
            "1": "1",
            "2": "2",
            "3": "3",
            "f": "1",
            "s": "2",
            "t": "3",
        },
        "number": {
            //singular
            "sg": "S",
            "s": "S",
            "singular": "S",
            "sing": "S",
            //dual
            "dual": "D",
            "d": "D",
            //plural
            "pl": "P",
            "p": "P",
            "plural": "P",
            "plu": "P",
        },
        "case": {
            // ??? -> ENG no one?!

            //ALkhalil
            "accusative": "ACC",
            "genitive": "GEN",
            "nominative": "NOM",

            //Mada
            "u": "-",
            "a": "ACC",
            "g": "GEN",
            "n": "NOM",

            //elixir
            "1": "NOM",
            "2": "ACC",
            "4": "GEN",

            //ATKS, aracomlex
            "nom": "NOM",
            "acc": "ACC",
            "gen": "GEN",
            "na": "",
            "-": "",
        },
        "voice": {
            "active": "ACT",
            "passive": "PASS",
            "a": "ACT",
            "p": "PASS",
            "act": "ACT",
            "pass": "PASS",
        },
        "state": {
            //mada
            "i": "INDEF",
            "d": "DEF",

            "c": "-", //????

            //AlKhalil
            "def": "DEF",
            "indef": "INDEF",
            "gen": "-", // ????

            //elixir
            "i": "INDEF",
            "d": "DEF",
            "r": "MDAF", // ???? gen in AlKhalil (mDAf)
            "a": "-", // ???? blA tnwyn
            "c": "DEF", // ???? mDAf mErfp
            "l": "INDEF", // ???? mDAf blA tEryf

        },
    },
    "ignore": [
        "tokens", "utf8", "gloss", "bw", "lem", "stem", "root", "lexmepattern", "structure", "num",
        "morphemes", "idonno", "twonum"
        ],
    wordalignment: function(data, key) {
        // case no word alignment requested
        var d = {
            meta:{
                key: key[0]
            },
            data: data
        }
        if(!argv.raw || argv.raw === true){
            return d;
        }

        //case alignment is based on non-seg input, diac input or input segmented using FA)
        if(key[0] == "Raw" || key[0] == "RawDia" || key[0] == "RawSeg" )
            if(key[0]==argv.raw){
                myparser.raw1 = d.data;
            }

        if(key[0]=="Words"){
            // preprocessing
            Object.keys(d.data).forEach(e=>d.data[e] = d.data[e].filter(f=>f!=null).map(f=>{
                return f.replace(/[\u064b-\u065f]/g, '').replace("\n","") // shortvowels}))
            }))
            myparser.raw1 = myparser.raw1.map(f=>{
                return f.replace(/[\u064b-\u065f]/g, '').replace("\n","") // shortvowels}))
            })
            if(!myparser.raw1) {
                myparser.raw1 = d.data[argv.raw];
            }
            if(!myparser.raw1){
                console.error("arg: raw is not valid")
                return d;
            }

            myparser.words=d.data;

            var mispen = 10, //not doing anything
                gappen = 1.0, //
                skwpen = .5; //


            for(var i in d.data){
                if(i==argv.raw)
                    continue
                if(i!="FA")
                    continue
                var result = stringalign(d.data[i], myparser.raw1, mispen, gappen, skwpen)
                console.error("Warning: Word Alignment is not enabled!");
                // console.error(d.data[i].join("\t"));
                // console.error(myparser.raw1.join("\t"));
                // // console.error(result)
                // console.error("----------------")
                // console.error(result.a.join("\t"))
                // console.error(result.b.join("\t"))
                // console.error(result.s.join("\t"))
            }
            
            // if(myparser.debug) console.log(result);

            // var line = []
            // for(var i=j=0, ii=0,jj=0,x=0; i<result.a.size && j<result.b.size; i++, j++){
            //     if(result.a[i]!=" " && result.b[j]!=" ")
            //         line.push([jj++,ii++]);
            //     else if(result.a[i]!=" ")
            //         line.push(["X",ii++]);
            //     else if(result.b[j]!=" ")
            //         line.push([jj++,"X"]);
            // }
        }
        return d;
    },
    processWord: function(word, tool, wid,argv) {
        var s = [argv.n,wid,tool].join("-")
        if(argv.tag == "checked" || argv.tag == "all")
            word.iscorrect = myparser.checked[s];
        
        if(argv.tag == "choosed" || argv.tag == "all")
            if(!word.analyses || word.analyses.length == 0){
                if(!word.error) word.error = "No analyses"
            }
            else if(word.analyses.length == 1)
                word.choice = 0;
            else if(myparser.choosed[s])
                word.choice = myparser.choosed[s];
            else if(word.choice != undefined)
                word.choice = word.choice;
            else{
                // for (var k in word.analyses) {
                //     var a = word.analyses[k];
                //     word.analyses[k].dist = getEditDistance(a.utf8, d[whichRaw][wid]);
                // }
                if(!myparser.raw2[wid])
                    console.error("Source input is not defined for",wid);

                word.analyses.forEach(function(obj){
                    obj.dist = getEditDistance(this.utf8, myparser.raw2[wid]);
                },word)
                if (word.analyses && word.analyses.sort) {
                    word.analyses.sort(function(a, b) {
                        if (a.dist > b.dist)
                            return 1;
                        else if (a.dist < b.dist)
                            return -1;
                        return 0;
                    });
                    var dist = word.analyses[0].dist;
                    var aaa = word.analyses.filter(function(obj){
                        return obj.dist == dist;
                    })
                    // if(aaa.length == 1){
                    //     word.analyses = aaa;
                    //     word.choice = 0;
                    // }
                } else {
                    console.error(word);
                }

            }

        // Uniquer
        if(argv.t)
            word.analyses.forEach(function(obj){
                obj.utf8 = obj.utf8 ? obj.utf8.removeFinalTaskeel().basicTaskeel() : "";
                obj.mutf8 = "";
            },word)
        for (var aid in word.analyses) { // analyses

            if(argv.t)
                word.analyses[aid].morphemes.forEach(function(obj){
                    word.analyses[aid].mutf8 = word.analyses[aid].mutf8 + obj.utf8;
                    obj.utf8 = obj.utf8 ? obj.utf8.removeFinalTaskeel().basicTaskeel() : "";
                },word)

            for (var mid in word.analyses[aid].morphemes) { // morpheme
                if(argv.m){
                    word.analyses[aid].morphemes[mid].map = {};
                    for (var k in word.analyses[aid].morphemes[mid]) { // key
                        var x = null;
                        //pos tagging
                        if (argv.m == "all" && k == "pos" && myparser.values[k]) {
                            var v = word.analyses[aid].morphemes[mid][k].trim().replace("–", "-");
                            if (!myparser.values[k][tool]) {
                                console.error("tool is undefined", k, tool);
                                continue;
                            }
                            var value = myparser.values[k][tool][v];
                            if (!value) {
                                // key (original TAG) in the list of POS tag set is not found
                                console.error("value is undefined", v, "@", tool);
                                word.analyses[aid].morphemes[mid].map[k] = ""
                            } else if (value.length > 1) {
                                // multiple options!
                                // TODO research!
                                if(argv.e)
                                    stringifier.write({
                                        "tool": tool,
                                        "origTAG": word.analyses[aid].morphemes[mid][k],
                                        "destTAG": value,
                                        "isAmbiguious": "true",
                                        "example": word.analyses[aid].morphemes[mid]["utf8"]
                                    });

                                word.analyses[aid].morphemes[mid].map[k] = "";
                            } else {
                                if(argv.e)
                                    stringifier.write({
                                        "tool": tool,
                                        "origTAG": word.analyses[aid].morphemes[mid][k],
                                        "destTAG": value[0],
                                        "isAmbiguious": "false",
                                        "example": word.analyses[aid]["utf8"]
                                    });
                                word.analyses[aid].morphemes[mid].map[k] = value[0].replace(/\|.*/, "")
                            }


                        } else if (myparser.values[k]) { // in case I forgot to put the key
                            if (typeof word.analyses[aid].morphemes[mid][k] == "string")
                                x = myparser.values[k][word.analyses[aid].morphemes[mid][k].toLowerCase()];
                            else
                                x = myparser.values[k][word.analyses[aid].morphemes[mid][k]];

                            word.analyses[aid].morphemes[mid].map[k] = x || "";
                        }
                    }
                    if(argv.s){
                        //SAWALHA TAG
                        var str = [];
                        for (var e = 0; e < 22; e++) {
                            str[e] = "?";
                        };
                        for (var k in myparser.positions) {
                            var value = word.analyses[aid].morphemes[mid].map[k];
                            //translate it
                            value = myparser.sawalha[k][value];
                            str[myparser.positions[k]] = !value ? "?" : value;
                        }

                        if (!word.analyses[aid].morphemes[mid].map["mood"]) {
                            var value = word.analyses[aid].morphemes[mid].map["case"];
                            value = myparser.sawalha["case"][value];
                            str[11] = !value ? "?" : value;
                        } else if (!word.analyses[aid].morphemes[mid].map["case"]) {
                            var value = word.analyses[aid].morphemes[mid].map["mood"];
                            value = myparser.sawalha["mood"][value];
                            str[11] = !value ? "?" : value;
                        } else if (word.analyses[aid].morphemes[mid].map["case"] == "" && word.analyses[aid].morphemes[mid].map["mood"] == "") {
                            str[11] = "?";
                        } else {
                            // console.error(word.analyses[aid]);
                            console.error("case or mood not empty", word.analyses[aid].morphemes[mid]["case"], word.analyses[aid].morphemes[mid]["mood"])
                        }
                        word.analyses[aid].morphemes[mid].sawalaha = str.join("");
                        if(argv.md5)
                            word.analyses[aid].morphemes[mid].md5 = md5(str.join("")).substr(0,5)
                    }
                }
            }
            if(!word.error && argv.md5)
                word.analyses[aid].md5 = md5(word.analyses[aid].morphemes.map(function(o){ o.md5}).join("")).substr(0,5)
        }
        if(!word.error){
            if(!word.analyses)
                console.error(word);
            if(argv.md5)
                word.md5 = md5(word.analyses.map(function(o){o.md5}).join("")).substr(0,5)
        }
        else if(argv.md5)
            word.md5 = md5(word.error).substr(0,5)
        return word
    },
    process: function(d, key,argv) {
        var tool = d.meta.key;
        var data = d.data
        if(tool=="RawDia"){
            myparser.raw2 = data;
            this.emit("data",[tool,data])
            return
        }
        else if(tool=="Raw"){
            if(!myparser.raw2)
                myparser.raw2 = data;
            this.emit("data",[tool,data])
            return
        }
        else if(tool=="RawSeg"){
            if(!myparser.raw2)
                myparser.raw2 = data;
            this.emit("data",[tool,data])
            return
        }
        else if(tool=="Words"){
            this.emit("data",[tool,data])
            return
        }

        if(tool.length != 2)
            return undefined;

        //data
        for (var wid in data) { //words
            data[wid] = myparser.processWord(data[wid],tool,wid,argv)
        }
        this.emit("data",[tool,data])
        return
    },
};

if (require.main === module) { // called directly
    var argv = require('yargs')
    .usage('Usage: $0 [-m all|exceptPos] [-st] [-e example_filename] -f filename')
    .default('f',"/dev/stdin")
    .demand('n').describe('n','Name of input e.g. 29-10')
    .describe('raw','toolname or RAW to use as the pivot for word alignment. Word Alignment is not done otherwise.')
    .describe("m", "(all|exceptPos) map each feature (gender, person, etc) to a unique value as in SAWALHA")
    .boolean("s").describe("s", "map each analysis to SAWLAHA 22-feature represetation. requires -m to work.")
    .describe("tag", "(choosed|checked|all) mark the choosed/checked/both analysis according to output of manual disamiguation done in SAWALHA.")
    .describe("e", " (filename) write a CSV file of examples ")
    .boolean("t").describe("t", "process the taskeel according to edit distance")
    .boolean("md5").describe("--md5", "compute md5 check sum. requires -s to work.")
    .describe("align", "(ru)le-based,(sp)ervised,(un)supervised,(ch)ar-based,(st)em-and-affixes]")
    .argv


    argv.source = fs.readFileSync(argv.source, "utf8");
    argv.atEnd = function() { //optional
                this.emit("data", ["META",{
                    name:argv.n,
                    date: new Date(),
                    tools: tools.join(":")
                }]);
                this.emit('end')
            }
    var p = main(
        fs.createReadStream(argv.f)
        ,argv)
    if(p)
        p.pipe(JSONStream.stringifyObject()).pipe(process.stdout)
    process.stdout.on('error', process.exit);
    
    process.stdout.on('finish', function() {
        console.error(JSON.stringify(examples));
    });

}
else{
    exports.allTools = {
        uniqueFromFile : function(fileInput, tools, name, opts){
            opts.atEnd = () => this.emit('end')
            opts.n = name
            opts.f = fileInput
            return main(fs.createReadStream(fileInput),{
                "tool" : tool,
                "source" : fs.readFileSync(sourceFile, "utf8")
            })
            opts.t = tools
            return main(
                    fs.createReadStream(fileInput)
                    .pipe(JSONStream.parse("*",function(data,key){
                        return [key[0],data];
                    })), opts)
        },
        uniqueFromJSON : function(input, tools, opts){
            var Readable = require('stream').Readable
            var i = new Readable()
            if(Array.isArray(input))
                input.forEach(x=>i.push(x))
            else
                i.push(input)
            i.push(null) // indicates end-of-file basically - the end of the stream
            if(!opts)
                opts = {}
            opts.t = tools
            return main(i,opts)
        }
    }
    exports.oneTool = {
        uniqueFromJSON : function(input, tool,raw, opts){
            opts.tool = tool
            return main(input, opts)
        }
    }
}
function main(instream, argv){
    myparser.init(argv)
    if(argv.wordalignment)
        var r = instream
            .pipe(JSONStream.parse("*", myparser.wordalignment))
    else
        var r = instream
    var counter = 0
    if(argv.tool) // oneTool
        return r.pipe(es.through(function(word){
            this.emit("data",myparser.processWord(word,argv.tool,counter++,argv))
        },argv.atEnd))
    else
        return r.pipe(es.through(function(a,b){
            return myparser.process(a,b,argv)
        },argv.atEnd))
}
function getEditDistance(a, b) {
            if ((!a || a.length === 0) && (!b || b.length === 0)) return 0;
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


function stringalign(ain, bin, mispen, gappen, skwpen) {
    var i, j, k;
    var dn, rt, dg;
    var ia = ain.length,
        ib = bin.length;
    var aout = []; // .resize(ia+ib);
    var bout = [];
    var summary = [];

    var cost = [];
    var marked = [];
    for (n = 0; n < ia + 1; ++n) {
        cost[n] = new Array(ib + 1);
        marked[n] = new Array(ib + 1);
    }

    cost[0][0] = 0.;
    for (i = 1; i <= ia; i++) cost[i][0] = cost[i - 1][0] + skwpen;
    for (i = 1; i <= ib; i++) cost[0][i] = cost[0][i - 1] + skwpen;
    for (i = 1; i <= ia; i++)
        for (j = 1; j <= ib; j++) {
            // dn = cost[i - 1][j] + ((j == ib) ? skwpen : gappen);
            // rt = cost[i][j - 1] + ((i == ia) ? skwpen : gappen);
            dn = cost[i - 1][j] + ((j == ib) ? skwpen : gappen); 
                    //  getEditDistance(ain[i - 1], ain[i - 1]));
            rt = cost[i][j - 1] + ((i == ia) ? skwpen : gappen);
                    //  getEditDistance(bin[j - 1], bin[j - 1]));
            dg = cost[i - 1][j - 1] +  getEditDistance(ain[i - 1], bin[j - 1]) //+ ((ain[i - 1] == bin[j - 1]) ? -1. : mispen);
            cost[i][j] = Math.min(dn, rt, dg);
        }
    i = ia;
    j = ib;
    k = 0;
    while (i > 0 || j > 0) {
        marked[i][j] = 1;
        dn = rt = dg = 9.99e99;
        // if (i > 0) dn = cost[i - 1][j] + ((j == ib) ? skwpen : gappen);
        // if (j > 0) rt = cost[i][j - 1] + ((i == ia) ? skwpen : gappen);
        if (i > 0)                 dn = cost[i - 1][j] + ((j == ib) ? skwpen : gappen);
                    //  getEditDistance(ain[i - 1], ain[i - 1]));

        if (j > 0)                 rt = cost[i][j - 1] + ((i == ia) ? skwpen : gappen);
                    //  getEditDistance(bin[j - 1], bin[j - 1]));

        if (i > 0 && j > 0)
        // dg = cost[i - 1][j - 1] + ((ain[i - 1] == bin[j - 1]) ? -1. : mispen);
            dg = cost[i - 1][j - 1] + getEditDistance(ain[i - 1], bin[j - 1]) 
        if (dg <= Math.min(dn, rt)) {
            aout[k] = ain[i - 1];
            bout[k] = bin[j - 1];
            summary[k++] = ((ain[i - 1] == bin[j - 1]) ? '=' : '!'+getEditDistance(ain[i - 1], bin[j - 1]));
            i--;
            j--;
        } else if (dn < rt) {
            aout[k] = ain[i - 1];
            bout[k] = ' ';
            summary[k++] = ' ';
            i--;
        } else {
            aout[k] = ' ';
            bout[k] = bin[j - 1];
            summary[k++] = ' ';
            j--;
        }
        marked[i][j] = 1;
    }
    for (i = 0; i < k / 2; i++) {
        var t = aout[k - 1 - i];
        aout[k - 1 - i] = aout[i];
        aout[i] = t;

        t = bout[k - 1 - i];
        bout[k - 1 - i] = bout[i];
        bout[i] = t;

        t = summary[k - 1 - i];
        summary[k - 1 - i] = summary[i];
        summary[i] = t;
    }
    aout.size = k;
    bout.size = k;
    summary.size = k;


    //brilliant DO NOT REMOVE IT 
    if(false){
        var table=""; 
        table+="\t";
        table+=bin.join("\t")
        table+="\n";
        for(n=0; n < cost.length; ++n)  {
            table+="\n";
            if(n < cost.length - 1)
                table+=""+ain[n]+"\t";
            else
                table+="\t";
            for(m=0; m < cost[n].length; ++m) {
                if(marked[n][m]==1){
                    table+=chalk.green(cost[n][m].toFixed(2))+"\t";
                }
                else
                    table+=cost[n][m].toFixed(2)+"\t";
            }
            table+="\n";
        }
        console.error(table);
    }
    return {
        a: aout,
        b: bout,
        s: summary
    };
}
