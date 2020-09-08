/*
  lex.js: Lexer for both production/graphics languages
*/

// Container for smallest meaningful units within either the 
// production/graphics languages. The lexer produces a list of tokens
class Token {
  constructor(name, lexeme) {
    this.name = name;
    this.lexeme = lexeme;
  }
}

// Lexer matches a character stream against patterns to produce tokens
class Lexer {

  constructor(patterns, makeToken) {
    this.patterns = patterns;

    // The makeToken function constructs a token from the given pattern and 
    // its match. Assumes the pattern matched & capture groups exist if needed
    this.makeToken = makeToken;
  }

  // Breaks input text into tokens, which must all be separated by whitespace
  lex(text) {
    let tokens = [];

    while (text.length > 0) {
      let chosenToken;
      let maximalMunchSize;

      // try each pattern against the head of the text
      for (let i = 0; i < this.patterns.length; i++) {
        let p = this.patterns[i];
        let m = text.match(p.re);

        if (!m || m.length == 0) continue; // try next pattern

        let munchSize = m[0].length;

        // if a longer match has been found, update the max.
        // note: this preserves priority of ordering of patterns as 
        // it keeps the *first* longest match
        if (!maximalMunchSize || munchSize > maximalMunchSize) {
          chosenToken = this.makeToken(p, m);
          maximalMunchSize = munchSize;
        }
      }

      // failed to match any token patterns
      if (!chosenToken || !maximalMunchSize)
        throw new Error(`Invalid token: '${this.retrieveInvalid(text)}'`);

      // include all non-whitespace tokens
      if (chosenToken.name != 'whitespace')
        tokens.push(chosenToken);

      // move past the parsed lexeme
      text = text.substring(maximalMunchSize);
    }

    return tokens;
  }

  // Read chars until whitespace from front of text
  // (used to retrieve what we think is an invalid token for errors)
  retrieveInvalid(text) {
    let m = text.match(new RegExp('^[^\\s]*'));
    if (!m || m.length < 1) return text;
    return m[0];
  }

}