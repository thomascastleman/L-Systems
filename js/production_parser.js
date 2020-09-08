/*
  production_parser.js: Parser/data structures for the production rules
*/

/* -------------- Production Rules Grammar --------------

  <rule-list> := <rule> <rule-list>
    | epsilon

  <rule> := <lhs> <arrow> <rhs-list>

  <lhs> := <opt-lc> <char> <opt-rc>

  <opt-lc> := <lc>
    | epsilon

  <opt-rc> := <rc>
    | epsilon

  <rhs-list> := <rhs>
    | <rhs> <pipe> <rhs-list>

  <rhs> := <string>
    | <empty>

*/

// Parser for user-defined production rules of the L system
class ProductionParser extends Parser {

  constructor(text) {
    super();

    let lexer = new Lexer([
      { re: new RegExp('^==>'), name: 'arrow' },
      { re: new RegExp('^\\|'), name: 'pipe' },
      { re: new RegExp('^([^<>\\s])\\s*<'), name: 'left-context' },
      { re: new RegExp('^>\\s*([^<>\\s])'), name: 'right-context' },
      { re: new RegExp('^\\empty'), name: 'empty' },
      { re: new RegExp('^([^<>\\s$^=|]+)'), name: 'string' },
      { re: new RegExp('^\\s*'), name: 'whitespace' }
    ],
    (pattern, match) => {
      switch (pattern.name) {
        case 'left-context':
        case 'right-context':
        case 'string':
          if (match.length < 2)
            throw new Error(`Failed to extract lexeme of ${pattern.name} at '${match[0]}'`);

          // use first capture group as lexeme
          return new Token(pattern.name, match[1]);
    
        default:
          return new Token(pattern.name);
    
      }
    });

    this.tokens = lexer.lex(text);
    this.index = 0;
  }

  // parse production rules text into a ProductionRules instance
  parse() {
    let pr = new ProductionRules();
    this.stmtNum = 1; // rule count for error reporting

    while (!this.eof()) {
      let r = this.parseRule();
      pr.addRule(r.char, r);
      this.stmtNum++;
    }

    return pr;
  }

  // Parse a single rule off the input
  // Returns a ContextRule
  parseRule() {
    // parse lefthand side, ==>, then list of replacement strings
    let lhs = this.parseLHS();
    this.eat('arrow');
    let replacements = this.parseRHSList();

    return new ContextRule(lhs.char, lhs.left, lhs.right, replacements);
  }

  // Parse a single lefthand side off the input
  // Returns { char, left, right } indicating the affected char
  // and its left/right context
  parseLHS() {
    // assume no context given at first
    let left = contexts.NULL;
    let right = contexts.NULL;

    // gather any left context
    if (this.checkPeek('left-context')) {
      left = this.getContext(this.next().lexeme);
    }

    // parse the char the rule actually applies to
    let charTok = this.next();

    if (charTok.name != 'string' || charTok.lexeme.length != 1)
      throw new Error(`Expected a single character for the LHS, got '${charTok.lexeme}'` + 
        ` at rule ${this.stmtNum}`);

    let char = charTok.lexeme;

    // gather any right context
    if (this.checkPeek('right-context')) {
      right = this.getContext(this.next().lexeme);
    }

    return { char, left, right };
  }

  // Get a context that matches the given character
  // If $ or ^, handle as final & initial contexts
  getContext(c) {
    switch (c) {
      case '^':
        return contexts.INITIAL;
      case '$':
        return contexts.FINAL;
      default:
        return c;
    }
  }

  // Parse an arbitrary amount of consecutive righthand sides
  // Returns a list of replacement strings
  parseRHSList() {
    // parse a single replacement string first
    let replacements = [this.parseRHS()];

    // while other variants exist, parse them
    while (this.checkPeek('pipe')) {
      this.eat('pipe');
      replacements.push(this.parseRHS());
    }

    return replacements;
  }

  // Parse a single righthand side
  // Returns a replacement string
  parseRHS() {
    let next = this.peek();

    switch (next.name) {
      case 'empty':
        this.eat('empty');
        return "";  // empty replacement string

      case 'string':
        return this.next().lexeme;  // return the parsed string literal

      default:
        throw new Error(`Expected a replacement string or \empty indicator,` + 
          ` got ${next.name} at rule ${this.stmtNum}`);
    }
  }

}

// ContextRule encodes a single production rule with context,
// where the given char, when appearing in the given left/right context,
// can be replaced with any of the given replacement strings
class ContextRule {
  constructor(c, l, r, replacements) {
    this.char = c;
    this.left = l;
    this.right = r;
    this.replacements = replacements;

    // specificity is number of non-null context indicators in the rule
    // (lookup opts for most specific matching rule)
    this.specificity = 2 - (l === contexts.NULL ? 1 : 0)
                         - (r === contexts.NULL ? 1 : 0);
  }
}

// Class to manage mapping of characters+contexts to their replacements
class ProductionRules {

  constructor() {
    /* charToRules takes the form:
        {
          "<char>" --> [
            ContextRule(<left1>, <right1>, [<replacements> ...]),
            ContextRule(<left2>, <right2>, [<replacements> ...]),
            ...
          ],
          ...
        }

        Left & right context indicators can take the form of:
          - a char literal
          - contexts.NULL
          - contexts.INITIAL
          - contexts.FINAL
        */
    this.charToRules = {};
  }

  // adds an entry in charToRules for this char if none exists,
  // and adds the given rule to the rules list for this char
  addRule(char, rule) {
    // initialize entry for this char if none exists
    if (!this.charToRules[char]) {
      this.charToRules[char] = [rule];
    } else {
      this.charToRules[char].push(rule);
    }
  }

  // Find a list of strings of grammar symbols that could replace
  lookup(char, leftContext, rightContext) {
    let rules = this.charToRules[char];

    if (!rules) return null;  // no rules to match

    let mostSpecificMatch;

    for (let i = 0; i < rules.length; i++) {
      let r = rules[i];

      // check if rule matches the given context
      if ((r.left === contexts.NULL || r.left === leftContext) && 
          (r.right === contexts.NULL || r.right === rightContext)) {
        // check if this is the most specific match so far
        if (!mostSpecificMatch || r.specificity > mostSpecificMatch.specificity) {
          mostSpecificMatch = r;
        }
      }
    }

    if (!mostSpecificMatch) {
      return null;  // no rules matched
    }

    return mostSpecificMatch.replacements;
  }

}