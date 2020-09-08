
/* -------------- Graphics Instructions Grammar --------------

  <stmt-list> := <stmt> <stmt-list>
    | epsilon

  // assigns a graphical interpretation to a grammar symbol
  <stmt> := <char> <equals> <op>

  // primitive graphics operator
  <op> := <prim-op>
    | <block-start> <prim-op-block> <block-end>

  <prim-op> := <forward>
    | <leap>
    | <turn>
    | <push>
    | <pop>

  // non-empty block of primitive graphics operators
  <prim-op-block> := <prim-op>
    | <prim-op> <prim-op-block>

*/

class GraphicsParser extends Parser {

  constructor(text) {
    super();

    // Tokens: 
    // equals '='
    // block-start '{'
    // block-end '}'
    // forward 'forward <scale>'
    // leap 'leap <scale>'
    // turn 'turn <angle>'
    // push 'push'
    // pop 'pop'
    // char [^\\s{}]
    // whitespace

    // matching whitespace without newlines in forward/turn from:
    // https://stackoverflow.com/questions/3469080/match-whitespace-but-not-newlines

    let lexer = new Lexer([
      { re: new RegExp('^='), name: 'equals' },
      { re: new RegExp('^{'), name: 'block-start' },
      { re: new RegExp('^}'), name: 'block-end' },
      { re: new RegExp('^forward([^\\S\r\n]+(-?\\d*(\\.\\d*)?))?'), name: 'forward' },
      { re: new RegExp('^leap([^\\S\r\n]+(-?\\d*(\\.\\d*)?))?'), name: 'leap' },
      { re: new RegExp('^turn[^\\S\r\n]+(-?\\d*(\\.\\d*)?)'), name: 'turn' },
      { re: new RegExp('^push'), name: 'push' },
      { re: new RegExp('^pop'), name: 'pop' },
      { re: new RegExp('^([^\\s{}])'), name: 'char' },
      { re: new RegExp('^\\s*'), name: 'whitespace' }
    ],
    (pattern, match) => {
      switch (pattern.name) {
        case 'forward':
          if (match.length < 3)
            throw new Error(`Failed to extract scale from '${match[0]}'`);

          // if no scale factor given, default to 1
          if (match[2] == "" || match[2] == undefined)
            return new Token(pattern.name, 1);

          var scale = parseFloat(match[2]);

          if (isNaN(scale))
            throw new Error(`Invalid scale factor: '${match[2]}'`);

          return new Token(pattern.name, scale);

        case 'leap':
          if (match.length < 3)
            throw new Error(`Failed to extract scale from '${match[0]}'`);

          // if no scale factor given, default to 1
          if (match[2] == "" || match[2] == undefined)
            return new Token(pattern.name, 1);

          var scale = parseFloat(match[2]);

          if (isNaN(scale))
            throw new Error(`Invalid scale factor: '${match[2]}'`);

          return new Token(pattern.name, scale);

        case 'turn':
          if (match.length < 2)
            throw new Error(`Failed to extract rotation angle from '${match[0]}'`);

          if (match[1] == "")
            throw new Error(`turn command must take a rotation angle`);

          let angle = parseFloat(match[1]);

          if (isNaN(angle))
            throw new Error(`Invalid rotation angle: '${match[1]}'`);

          return new Token(pattern.name, angle);

        case 'char':
          if (match.length < 2)
            throw new Error(`Failed to extract character from statement: '${match[0]}'`)

          return new Token(pattern.name, match[1]);

        default:
          return new Token(pattern.name);
    
      }
    });

    this.tokens = lexer.lex(text);
    this.index = 0;
  }

  // Parse graphics instructions
  // Returns a GraphicsInstructions instance
  parse() {
    let gi = new GraphicsInstructions();
    this.stmtNum = 1; // statement count for error reporting

    while (!this.eof()) {
      let s = this.parseStmt();

      // record what graphical operators are attached to the symbol/how much they change the stack
      gi.addInstruction(s.char, s.operators.map(o => o.closure));
      gi.addStackChange(s.char, this.totalStackChange(s.operators));

      this.stmtNum++;
    }

    return gi;
  }

  // compute the total stack change of a sequence of operators
  totalStackChange(operators) {
    let total = 0;

    for (let i = 0; i < operators.length; i++) {
      total += operators[i].stackChange;
    }

    return total;
  }

  // Parse a single statement assigning graphical meaning
  // Returns { char, operators } where operators is a list of operator objects (closure/stack change)
  // representing graphics operations that correspond to char
  parseStmt() {
    let char = this.next();

    if (char.name != 'char')
      throw new Error(`Expected single character lefthand side, got ${char.name}` + 
        `${this.displayLexeme(char.lexeme)} at statement ${this.stmtNum}`);

    this.eat('equals');

    let operators = this.parseOperator();

    return { char: char.lexeme, operators };
  }

  // Parse a graphics operator or block of operators
  // Returns a list of closures
  parseOperator() {
    if (this.peek().name == 'block-start') {
      return this.parseBlock();
    } else {
      return [this.parsePrimOp()];
    }
  }

  // Parse a block of primitive graphics operators
  // Returns a list of closures
  parseBlock() {
    let operations = [];

    this.eat('block-start');

    // parse all operations in the block
    while (this.peek().name != 'block-end') {
      operations.push(this.parsePrimOp());
    }

    this.eat('block-end');

    // block must have at least 1 operation
    if (operations.length == 0)
      throw new Error(`Unexpected empty block at statement ${this.stmtNum}`);

    return operations;
  }

  // Parse a single primitive graphics operator
  //  - forward
  //  - turn
  //  - push
  //  - pop
  // Returns an object of the form:
  //  { closure: 0-ary closure that performs the indicated operation,
  //    stackChange: amount that this instruction changes the stack } 
  parsePrimOp() {
    let next = this.next();

    switch (next.name) {
      case 'forward':
        var scale = next.lexeme;

        // draw line/step forward based on step size & user-indicated scale factor
        return {
          closure: () => {
            line(0, STEP_LENGTH * scale, 0, 0);
            translate(0, STEP_LENGTH * scale);
          },
          stackChange: 0
        };

      case 'leap':
        var scale = next.lexeme;

        // move without drawing a line
        return {
          closure: () => {
            translate(0, STEP_LENGTH * scale);
          },
          stackChange: 0
        };

      case 'turn':
        let angle = next.lexeme;
        return {
          closure: () => { rotate(angle) },
          stackChange: 0
        };

      case 'push':
        return {
          closure: () => { push() },
          stackChange: 1
        };

      case 'pop':
        return {
          closure: () => { pop() },
          stackChange: -1
        };

      default:
        throw new Error(`Expected a primitive graphics operation, got ${next.name}` + 
          `${this.displayLexeme(next.lexeme)} at statement ${this.stmtNum}`);
    }
  }

  // avoid printing 'undefined' when a lexeme doesn't exist
  displayLexeme(lexeme) {
    if (lexeme) {
      return ` '${lexeme}'`;
    } else {
      return '';
    }
  }

}

// let prgm = 
// `
// F = forward 0.5
// T = turn 120
// [ = push
// ] = pop

// X = {turn 0 push pop}

// S = {
//   turn 10 
//   push

//   forward 5
//   pop
//   turn -8

// }

// y=forward 10
// x =      forward -120.452138
// z    =turn -0.1239`;

// try {
//   let g = new GraphicsParser(prgm);
//   console.log(g.tokens);
//   console.log(g.parse());
// } catch (e) {
//   console.log(e);
// }