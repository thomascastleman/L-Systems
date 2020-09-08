/*
  Lsystem.js: Class for working with the L-system itself
*/

class Lsystem {

  constructor() {
    this.axiom;
    this.productionRules;
    this.graphicsInstructions;
    this.ignore;
    this.iteration = 10;
    this.Lstring = '';
  }

  // calculate the L system's string after several generations
  calculateString(){
    var originalAxiom = this.axiom
    var newAxiom = '', sym, randRHS;

    // for each iteration
    for (var i = 0; i < this.iteration; i++){
      newAxiom = ''

      // console.log(`--------------------------- NEW ITERATION ${i} ---------------------------`);
      // console.log(`String: '${originalAxiom}'`);

      // expand each symbol based on its production rules
      for (var c = 0; c < originalAxiom.length; c++){
        sym = originalAxiom[c];

        // find context for this symbol
        let leftCtxt = this.findContext(originalAxiom, c, 
          (i) => i < 0,
          contexts.INITIAL,
          (sc) => sc < 0,
          (sc) => sc > 0,
          (i) => i - 1);

        let rightCtxt = this.findContext(originalAxiom, c, 
          (i) => i >= originalAxiom.length,
          contexts.FINAL,
          (sc) => sc > 0,
          (sc) => sc < 0,
          (i) => i + 1);

        // // debug!
        // function ctxt(c) {
        //   if (typeof c == "string")
        //     return c;

        //   switch (c) {
        //     case contexts.NULL:
        //       return 'NULL';
        //     case contexts.INITIAL:
        //       return 'INIT';
        //     case contexts.FINAL:
        //       return 'FIN';
        //   }
        // }
        // console.log(`Char: '${sym}' lc: ${ctxt(leftCtxt)}, rc: ${ctxt(rightCtxt)}`);

        // lookup possible replacement strings for this symbol within this context
        let possibleRHS = this.productionRules.lookup(sym, leftCtxt, rightCtxt);

        if (possibleRHS) {
          // select a random string from the possible righthand sides 
          if (possibleRHS.length == 1) {
            randRHS = possibleRHS[0];
          } else {
            randRHS = possibleRHS[Math.floor(Math.random() * possibleRHS.length)];
          }

          // add the random RHS to the new string
          newAxiom += randRHS;

        } else {
          // just add the symbol
          newAxiom += sym;
        }
      }
      originalAxiom = newAxiom;

    }
    this.Lstring = originalAxiom;
  }

  // move in one direction down the string until a non-ignored symbol is encountered
  // or an extreme (start/end), and use this as the context
  findContext(string, i, isPastExtreme, extremeCtxt, pushed, popped, move) {
    let next = move(i);

    let mismatch = new Error(`Push/pop brackets do not match in produced string: '${string}'.`);

    while (true) {
      // if at end of string
      if (isPastExtreme(next))
        return extremeCtxt;

      // when we hit a symbol that imbalances the stack change, rebalance it to 0
      let curStackChange = this.graphicsInstructions.lookupStackChange(string[next]);
      while (pushed(curStackChange)) {
        next = move(next);

        if (isPastExtreme(next))
          throw mismatch;

        curStackChange += this.graphicsInstructions.lookupStackChange(string[next]);

        // stack change should never become popped once it was pushed--it should just return to 0
        if (popped(curStackChange))
          throw mismatch;
      }

      // if not ignored & not a stack-changing symbol (ignored by default), use as context
      if (!this.ignore.includes(string[next]) && this.graphicsInstructions.lookupStackChange(string[next]) == 0)
        return string[next];

      next = move(next);
    }
  }

  // display the L system to the world
  drawLsys() {
    // for each symbol in the string
    for (var c = 0; c < this.Lstring.length; c++){
      var character = this.Lstring[c];

      let action = this.graphicsInstructions.lookup(character);

      // if there is graphical meaning associated with this symbol
      if (action) {
        // call each of the associated graphics operations, in order
        for (let a = 0; a < action.length; a++) {
          action[a]();
        }
      }
    }
  }

}