var main =  {
        counter : null,
        parseTag: function(tag) {
            var obj = {};
            tag = tag.replace(/؟/g, "?")
            tagarr = tag.split(",");
            if (tagarr[0] == "p")
                obj.pos = "p" + tagarr[1];
            if (tagarr[0] == "u")
                obj.pos = "u" + tagarr[1];

            if (tagarr[0] == "n" || tagarr[0] == "v") {
                obj.gender = tagarr[1];
                obj.number = tagarr[2];
                obj.person = tagarr[3];
            }
            if (tagarr[0] == "n") {
                obj.pos = "n" + tagarr[5];
                obj.state = tagarr[6];
                obj["case"] = tagarr[4];
            }
            if (tagarr[0] == "v") {
                obj.mood = tagarr[4];
                obj.aspect = tagarr[5];
                obj.pos = "v" + tagarr[5];
                obj.voice = tagarr[6];
                obj.transitivity = tagarr[7];
                obj.perfectness = tagarr[8];
            }

            return obj;
        },
        process: function(text, callback) {
            var th = myparser["Qutuf"];
            if (!text)
                return callback(null);

            data = JSON.parse(text);
            if (data.original_string == " " || data.original_string == "\n")
                return callback(null);
            data.wordpos = myparser["Qutuf"].counter;
            var result = {
                // orig: text,
                wutf8: data.original_string,
                analyses: [],
            };
            for (var i in data.SurfaceFormMorphemes) {
                var m = data.SurfaceFormMorphemes[i];
                var obj = {
                    prefix: [],
                    suffix: [],
                    prefix_pos: [],
                    suffix_pos: [],
                    morphemes: [],
                    utf8: m.voweled_form,
                };


                obj.prob = parseFloat(m.certainty);

                if (m.Cliticless) {
                    var t = m.Cliticless.tag;

                    //extend
                    var pT = th.parseTag(t);
                    for (var k in pT) {
                        obj[k] = pT[k];
                    }
                }

                obj.morphemes.push(getCleanCopy(obj));
                
                if (!m.Proclitcs || !m.Proclitcs.Proclitcs) // if it is a string or undefined
                    m.Proclitcs = [];
                else if (! m.Proclitcs.Proclitcs.length) // if it is an object
                    m.Proclitcs = [m.Proclitcs.Proclitc];
                else
                    m.Proclitcs = m.Proclitcs.Proclitc;
                
                if (!m.Enclitics) // if it is a string or undefined
                    m.Enclitics = [];
                else if (! m.Enclitics.length) // if it is an object
                    m.Enclitics = [m.Enclitics.Enclitic];
                else
                    m.Enclitics = m.Enclitics.Enclitic;

                for (var j in m.Proclitcs) {
                    obj.prefix.push(th.parseTag(m.Proclitcs[j].tag))
                    obj.prefix_pos.push(m.Proclitcs[j].tag)
                }

                for (var j in m.Enclitics) {
                    obj.suffix.push(th.parseTag(m.Enclitics[j].tag))
                    obj.suffix_pos.push(m.Enclitics[j].tag)
                }

                result.analyses.push(obj);
            }
            if(result.analyses.length == 0)
                result.error = "Unknown Word";
            myparser["Qutuf"].counter++;
            callback(null, result);
        },
    },
