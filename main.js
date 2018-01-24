#!/usr/bin/env node
/**
This file parse the content of the raw results of the tool sent from the standard input.
params: tool name
content are given from the stdin
*/
"use strict";
const chalk = require('chalk');
var JSONStream = require('JSONStream');
var fs = require('fs');
var es = require('event-stream');
var config = require('./config');

function main(instream, argv){
    var tool = argv.tool
    var source = fs.readFileSync(argv.source, "utf8");


    console.error(chalk.yellow("Parsing",argv.tool,argv.source ? argv.source : ""))
    if (argv.tool == "AR") {
        var main = require('./resultsParser.AR.js');
        return instream
            .pipe(es.split("\n\n"))
            .pipe(es.map(main.process))
            

    } else if (argv.tool == "MD") {
        let MDParser = require('./resultsParser.MD.js');
        let maparser = new MDParser("MD",config)
        //Copy/Pasted from MADA
        return instream
            .pipe(es.split("--------------\n"))
            .pipe(es.map(maparser.process))
            

    } else if (argv.tool == "ST") {
        let STParser = require('./resultsParser.ST.js');
        let stparser = new STParser(source,config)
        return instream
            .pipe(es.split(" "))
            .pipe(es.map(stparser.process))
            .pipe(es.through(stparser.postprocess(),
                function end() { //optional
                    var res = stparser.sendData()
                    if(res)
                        this.emit("data", res);
                    // this.emit("data", main.postprocess(null));
                    this.emit('end')
                }))
            

    } else if (argv.tool == "XE") {
        var main = require('./resultsParser.XE.js');
        return instream
            .pipe(JSONStream.parse("analyzeResponse.analyzeResult.arabic-morphology.words.*.*"))
            .pipe(es.map(main.process))
            


    } else if (argv.tool == "MT") {
        var main = require('./resultsParser.MT.js');
        return instream
            .pipe(JSONStream.parse("*"))
            .pipe(es.through(function(data,cb){
                // console.error(data);
                for(var i in data.pos)
                    this.emit("data",data.pos[i])
            }))
            .pipe(es.map(main.process))
            


    } else if (argv.tool == "MS") {
        var main = require('./resultsParser.MS.js');
        return instream
            .pipe(JSONStream.parse("*"))
            // .pipe(es.through(function(data,cb){
            //     // console.error(data);
            //     for(var i in data.sarf)
            //         this.emit("data",data.sarf[i])
            // }))
            .pipe(es.map(main.processSarf))
            


    } else if (argv.tool == "QA") {
        let QAParser = require('./resultsParser.QA.js');
        let qaparser = new QAParser(source,config)
        return instream
            .pipe(es.split("\n"))
            .pipe(es.map(qaparser.process))
            .pipe(es.through(qaparser.process2(), function end() {
                this.emit('data', qaparser.savedWord)
                this.emit('end')
            }))
            .pipe(es.through(qaparser.process3()))
            .pipe(es.through(qaparser.process4()))
            

    } else if (argv.tool == "SW") {
        let SWParser = require('./resultsParser.SW.js');
        let swparser = new SWParser(config)
        // var savedWordPos = 1;
        // var savedWord = {
        //     prefix: [],
        //     suffix: [],
        //     morphemes: [],
        //     prefix_pos: [],
        //     suffix_pos: [],
        //     wutf8: "",
        // };
        // var savedAyah = null;
        // var counter = 0;
        return instream
            .pipe(JSONStream.parse("words.*"))
            .pipe(es.map(swparser.process()))
            

    } else if (argv.tool == "EX") {
        let EXParser = require('./resultsParser.EX.js');
        let exparser = new EXParser(config)
        return instream
            .pipe(es.split("\n"))
            .pipe(es.through(exparser.process(),
                function end() { //optional
                    if (exparser.word)
                        exparser.post_process(this);
                    this.emit('end')
                }))
            //.pipe(es.mapSync(main.process))

    } else if (argv.tool == "MA") {
        let MDParser = require('./resultsParser.MD.js');
        let maparser = new MDParser("MA",config)
        return instream
            .pipe(es.split("--------------\n"))
            .pipe(es.map(maparser.process))
            


    } else if (argv.tool == "MX") {
        let MXParser = require('./resultsParser.MX.js');
        let mxparser = new MXParser(config)
        //Copy/Pasted from MADA
        return instream
            .pipe(JSONStream.parse("madamira_output.out_doc.out_seg.word_info.word.*"))
            .pipe(es.map(mxparser.process()))
            


    } else if (argv.tool == "AL" ) {
        let MDParser = require('./resultsParser.MD.js');
        let maparser = new MDParser("AL",config)
        //Copy/Pasted from MADA
        return instream
            .pipe(es.split("--------------\n"))
            .pipe(es.map(maparser.process))
            


    } else if (argv.tool == "BP") {
        var main = require('./resultsParser.BW.js');
        return instream
            .pipe(es.split("\n\n"))
            .pipe(es.map(main.process))
            

    } else if (argv.tool == "None") {
        var main = require('./resultsParser.None.js');
        return instream
            .pipe(JSONStream.parse("*"))
            

    } else if (argv.tool == "AlKhalil") {
        var main = require('./resultsParser.AlKhalil.js');
        return instream
            .pipe(JSONStream.parse("*"))
            .pipe(es.map(main.process))
            

    } else if (argv.tool == "KH") {
        var main = require('./resultsParser.KH.js');
        return instream
            .pipe(es.split("\n"))
            .pipe(es.map(main.process))
            

    } else if (argv.tool == "BJ") {
        var main = require('./resultsParser.BW.js');
        return instream
            .pipe(JSONStream.parse("*"))
            .pipe(es.map(main.processJava))
            

    } else if (argv.tool == "AM") {
        var AMParser = require('./resultsParser.AM.js');
        var amparser = new AMParser(source,config)
        return instream
            .pipe(es.split(/\s/))
            .pipe(es.map(amparser.process))
            .pipe(es.through(amparser.postprocess(),
                function end() { //optional
                    this.emit("data", amparser.postprocess()(null));
                    this.emit('end')
                }))
            

    } else if (argv.tool == "FA") {
        var FAParser = require('./resultsParser.FA.js');
        var faparser = new FAParser(source,config)
        return instream
            .pipe(es.split(" "))
            .pipe(es.map(faparser.process))
            .pipe(es.through(faparser.postprocess(),
                function end() { //optional
                    this.emit("data", faparser.postprocess()(null));
                    this.emit('end')
                }))
            

    } else if (argv.tool == "QT") {
        var main = require('./resultsParser.QT.js');
        var counter = 0;
        return instream
            .pipe(es.split("\n"))
            .pipe(es.map(main.process))
            

    } else if (argv.tool == "MR") {
        var main = require('./resultsParser.MR.js');
        return instream
            .pipe(es.split("\n"))
            .pipe(es.map(main.process))
            .pipe(es.through(main.postprocess,
                function end() { //optional
                    var res = main.sendData();
                    if(res){
                        this.emit("data", res);
                    }
                    // this.emit("data", main.postprocess(null));
                    this.emit('end')
                }))
            

    } else if (argv.tool == "WP") {
        var main = require('./resultsParser.WP.js');
        return instream
            .pipe(es.split("\n"))
            .pipe(es.through(main.process))
            // 
            
    } else if (argv.tool == "RAW") {
        return instream
            .pipe(es.split(/[ \n]+/))
            .pipe(es.map(function(data, callback) {
                callback(null, data.trim());
            }))
            

    } else {
        console.error("usage node resultsParser.main.js AraComLex|Mada|Stanford|Elixir|ATB4MT|MADAMIRA|BW|AlKhalil");
        process.exit();
    }
}
if (require.main === module) { // called directly
    var argv = require('yargs')
    .usage('Usage: $0 -t|--tool tool -s|--source sourcefile -i|--input rawtextfile')
    // .demand('f').describe("f","input file")
    .demand('tool').alias("tool", "t").describe('tool','Name of tool')
    .demand('source').alias("source", "s").describe('source','path to source raw input text file')
    .demand('input').alias("input", "i").describe('input','convert from this file').default("i","/dev/stdin")
    .describe('d','debug')
    .argv
    var p = main(fs.createReadStream(argv.input),argv)
    if(p)
        p.pipe(JSONStream.stringify()).pipe(process.stdout)
}
else{
    exports.parseFile = function(inputFile,tool,sourceFile){
        return main(fs.createReadStream(inputFile),{
            "tool" : tool,
            "source" : fs.readFileSync(sourceFile, "utf8")
        })
    }
    exports.parseString = function(input,tool,source){
        var Readable = require('stream').Readable
        var i = new Readabl,confige
        i.push(input)
        i.push(null) // indicates end-of-file basically - the end of the stream
        return main(i,{
            "tool" : tool,
            "source" : source
        })
    }
}
process.stdout.on('error', process.exit);