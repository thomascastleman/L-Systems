
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

// let text = 
// `
// X ==> F+[[X]-X]-F[-FX]+X
// F ==> FF

// 0<C>2 ==> \empty

// 0 < 1 > 1 ==> 555
//   | \empty
//   | NEAT
// N==>O | A

// 1 > 0 ==> XY

// `;

// try {
//   let parser = new ProductionParser(text);
//   console.log(parser.tokens);
//   console.log(parser.parse());
// } catch (e) {
//   console.log(e);
// }