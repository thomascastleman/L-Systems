
class Token {
  constructor(name, lexeme) {
    this.name = name;
    this.lexeme = lexeme;
  }
}

class Lexer {

  constructor(patterns, makeToken) {
    this.patterns = patterns;

    // The makeToken function constructs a token from the given pattern and 
    // its match. Assumes the pattern matched & capture groups exist if needed
    this.makeToken = makeToken;
  }

  // Breaks input text into tokens, which must all be separated by whitespace
  lex(text, cb) {
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
      if (!chosenToken || !maximalMunchSize) {
        return cb(new Error(`Invalid token near '${text}'`));
      }

      // include all non-whitespace tokens
      if (chosenToken.name != 'whitespace')
        tokens.push(chosenToken);

      // move past the parsed lexeme
      text = text.substring(maximalMunchSize);
    }

    cb(null, tokens);
  }

}

// let prgm = 
// `
// 4 <

// 1   > 5==>222
// F==>41F
// `;

// let l = new Lexer([
//   { re: new RegExp('^==>'), name: 'arrow' },
//   { re: new RegExp('^\\|'), name: 'pipe' },
//   { re: new RegExp('^([^<>\\s])\\s*<'), name: 'left-context' },
//   { re: new RegExp('^>\\s*([^<>\\s])'), name: 'right-context' },
//   { re: new RegExp('^\\empty'), name: 'empty' },
//   { re: new RegExp('^([^<>\\s$^=|]+)'), name: 'string' },
//   { re: new RegExp('^\\s*'), name: 'whitespace' }
// ],
// (pattern, match) => {
//   switch (pattern.name) {
//     case 'left-context':
//     case 'right-context':
//     case 'string':
//       // use first capture group as lexeme
//       return new Token(pattern.name, match[1]);

//     default:
//       return new Token(pattern.name);

//   }
// });

// l.lex(prgm, (err, tokens) => {
//   if (err) console.log(err);
//   console.log(tokens);
// });