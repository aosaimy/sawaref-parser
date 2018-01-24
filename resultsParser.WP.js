var main =  {
        process: function(text) {
            var segments = text.split(" ");

            var result = [];


            var prefixes = [];
            for (var i = 0; i < segments.length; i++) {

                var s = segments[i].split("/");
                
                if(s.length != 2) // no word
                    continue;

                //handle prefix
                if (s[0].charAt(s.length - 1) == "+") {
                    prefixes.push(s);
                    continue;
                }

                var obj = {
                    wutf8: "", //myparser["Stanford"].savedAyah[counter],
                    orig: segments[i],
                    analyses: [],
                    wordpos: counter,
                };
                var analysis = {
                    prefix: [],
                    prefix_pos: [],
                    morphemes: [],
                    utf8: "",
                };


                analysis.roman = s[0];
                obj.wutf8 = analysis.utf8 = buckwalter.bw2utf(s[0]);
                analysis.orig = JSON.stringify(segments[i]);
                analysis.pos = s[1];

                analysis.prefix = prefixes;
                for (var j in prefixes) {
                    analysis.morphemes.push({
                        utf8: prefixes[j][0].replace("+",""),
                        pos: prefixes[j][1],
                        type: "prefix"
                    });
                    analysis.prefix_pos.push(prefixes[j][1]);
                }

                analysis.morphemes.push({
                    utf8: s[0],
                    orig: JSON.stringify(segments[i]),
                    pos: s[1],
                    type: "stem"
                });

                obj.analyses = [analysis];


                result.push(obj);
                prefixes = [];

            }
            // console.error(result);
            console.log(JSON.stringify(result));
            // return JSON.stringify(result);
        },
    },
