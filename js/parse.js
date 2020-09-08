
// Class encapsulating language-independent parsing functions
class Parser {
  constructor() {}

  // Peek at the next token in the input stream
  peek() {
    if (this.index >= this.tokens.length)
      throw new Error(`Attempted to read past last token`);

    return this.tokens[this.index];
  }

  // Check if the next token is of a given type
  checkPeek(name) {
    return !this.eof() && this.peek().name == name;
  }

  // Move past the next token while expecting it to be a certain type
  eat(tokenName) {
    let next = this.peek();

    if (next.name == tokenName) {
      this.index++;
    } else {
      let lexeme = next.lexeme != null ? ` ('${next.lexeme}')` : '';
      throw new Error(`Expected ${tokenName}, got ${next.name}` + 
        ` ${lexeme} at expression ${this.stmtNum}`);
    }
  }

  // Eat the next token and return it
  next() {
    let t = this.peek();
    this.eat(t.name);
    return t;
  }

  // check if we have run out of tokens
  eof() {
    return this.index >= this.tokens.length;
  }
}