
// parses the production rule text into a ProductionRules instance,
// which can lookup characters in context to find their possible replacements
function parseProductionRules(text, cb) {

}

class ParseResult {
  constructor(parsed, rest) {
    this.parsed = parsed;
    this.rest = rest;
  }
}

const whitespace_re = new RegExp('^\\s*');
const empty_re = new RegExp('^\\empty');
const arrow_re = new RegExp('^-->');
const replacement_re = new RegExp('^[^\\s]+');

// Try to match the given regular expression against the front of text
// Returns ParseResult containing the parsed portion & the rest of the input
function tryMatch(text, re) {
  let m = text.match(re);

  if (!m) return null;

  return new ParseResult(m[0], text.substring(m[0].length));
}

class ProductionParser {

  constructor() {}

  // Parse arbitrary whitespace off the input
  // Returns a ParseResult with the new index
  parseArbWhitespace(text) {
    let res = tryMatch(text, whitespace_re);
    if (res) return res;

    throw new Error(`Expected whitespace, found '${text}'`);
  }

  // Parse a single rule off the input
  // Returns a ContextRule within a ParseResult
  parseRule(text) {

  }

  // Parse a lefthand-side off the input
  // Returns { char, left, right } within a ParseResult to indicate
  // the char affected by the rule & its surrounding context.
  // left & right can be one of:
  //  - contexts.NULL
  //  - contexts.INITIAL
  //  - contexts.FINAL
  //  - a char literal
  parseLHS(text) {
    if (text.length == 0) {
      throw new Error(`Expected valid lefthand side, got '${text}'`);
    }

    let afterWS = this.parseArbWhitespace(text.substring(1));

    if (afterWS.rest.length == 0) throw new Error();

    if (afterWS.rest[0] == '<') {

    } else if (afterWS.rest[0] == '>') {

    }

    
  }

  parseContextIndicator(text) {
    if (text.length == 0) {
      throw new Error(`Expected context indicator, got '${text}'`);
    }

    let rest = text.substring(1);

    switch (text[0]) {
      case "^":
        return new ParseResult(contexts.INITIAL, rest);
      case "$":
        return new ParseResult(contexts.FINAL, rest);
      default:
        return new ParseResult(text[0], rest);
    } 
  }

  // Parse a sequence of (potentially many) righthand-sides off the input
  // Returns a list of replacement strings within a ParseResult.
  parseRHSList(text) {
    let replacements = [];
    let rest = text;

    // repeatedly parse RHS elements
    while (true) {
      // parse arbitrary leading whitespace
      rest = this.parseArbWhitespace(rest).rest;

      // parse a righthand side
      let rhs = this.parseRHS(rest);

      replacements.push(rhs.parsed);  // add parsed replacement string to list
      rest = rhs.rest;

      let afterWS = this.parseArbWhitespace(rest).rest;

      // if no more RHS to parse, end
      if (!afterWS || afterWS[0] != '|') break;

      rest = afterWS.substring(1); // eat the '|'
    }

    if (!replacements)
      throw new Error(`Expected valid replacement strings, got '${text}'`);

    return new ParseResult(replacements, rest);
  }

  // Parse a single righthand-side off the input
  // Returns a string within a ParseResult
  parseRHS(text) {
    // try to match against the \empty keyword
    let emptyMatch = tryMatch(text, empty_re);

    if (emptyMatch) {
      // represent empty strings with the empty string
      return new ParseResult("", emptyMatch.rest);
    }

    // try to match some replacement string (anything but whitespace)
    let replacementMatch = tryMatch(text, replacement_re);

    if (replacementMatch) return replacementMatch;

    throw new Error(`Expected a valid righthand side, found '${text}'`);
  }
}


// let parse = new ProductionParser();
// let t = "testing |X[F--+X]\n|\empty 0 < 1 > 0 --> F\n\n";
// let res = parse.parseRHSList(t);
// console.log(res);

// const text = 
// `0 < A > 1 --> B | C
// 0 < A --> DA
// B --> AC 
//   | 0A1
// A --> \\empty
// F --> D
//   | \\empty`;

// parseProductionRules(text, (err, pr) => {
//   if (err) console.log(err);
//   console.log(JSON.stringify(pr, null, 2));
// });

/*
  <rule> := <lhs> '-->' <rhs-list>

  <lhs> := <lc> <char> <rc>

  <lc> := <context> '<'
    | epsilon

  <rc> := '>' <context>
    | epsilon

  <context> := '^'
    | '$'
    | <char>

  <rhs-list> := <rhs>
    | <rhs> '|' <rhs-list>

  <rhs> := '\empty'
    | {<char>}+

*/