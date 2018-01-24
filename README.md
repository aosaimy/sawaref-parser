# sawaref-parser
A tool (part of sawaref toolkit) that parses several Arabic morphological taggers and unify their output into standard represenstation

## Supported POS taggers
1. **MADAMIRA TOOLKIT**: 
2. **Stanford POS tagger (ST)**:
3. **AMIRA Toolkit v.2 (AM)**:
4. **Farasa POS Tagger (FA)**:
In addition, there are some other taggers in the repo that was supported. 

## Supported Morphological Analysers:
1. **Elixir FM**:
2. **AlKhalil v.2**:
3. **Buckwalter (AraMorph)**:
4. **ALMOR**:

In addition, there are some other taggers in the repo that was supported. 

## Install
`npm install aosaimy/sawaref-parser`

## Usage
Assuming you have run the tagger on your text and the taggers results is saved on a file.
### Via Command Line: 
`cat taggedFile | sawaref-parser -t EX -s /path/to/source/file`

```
Usage: sawaref-parser -t|--tool tool -s|--source sourcefile -i|--input rawtextfile

Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  --tool, -t    Name of tool                                          [required]
  --source, -s  path to source raw input text file                    [required]
  --input, -i   convert from this file        [required] [default: "/dev/stdin"]
  -d            debug

  ```

## Test
This scripts has its own unit testing. You can add yours to `test/` folder. To run unit tests, run  `npm test`.
