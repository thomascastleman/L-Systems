
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

// // parses the production rule text into a ProductionRules instance,
// // which can lookup characters in context to find their possible replacements
// function parseProductionRules(rawText, cb) {
//   /*
//     Constructs hashtable of the following form:
//     {
//       “F” → [“F-G+F+G-F”, “FG”]
//       “G” → [“EGG”]
//       ...
//     }
//   */

//   // first, just extract what's on the left and right hand sides of each rule
//   parseRawText(rawText, (err, extractedRules) => {
//     if (err) return cb(err);

//     const rulesTable = {};
//     let lhs, rhs;

//     for (let i = 0; i < extractedRules.length; i++) {
//       lhs = extractedRules[i].LHS;
//       rhs = extractedRules[i].RHS;

//       // map LHS to all possible RHS 
//       if (!rulesTable[lhs]) {
//         rulesTable[lhs] = [rhs];
//       } else {
//         rulesTable[lhs].push(rhs);
//       }
//     }

//     cb(err, rulesTable);
//   });
// }

// parses the text from the actions definitions
function parseActions(rawText, cb) {
  /*
    Constructs hashtable of the following form:
    {
      “+” → [() => { rotate(120); }]
      “-” → [() => { rotate(-120); }]
      “F” → [() => { line(0, …); }, () => { translate(...); }]
      “[“ → [() => { push(); }]
    }
  */

  parseRawText(rawText, (err, extractedRules) => {
    if (err) return cb(err);

    const actionsTable = {};
    let lhs, rhs;
    let righthandSides, actionsList;

    const turn = /turn(-?\d+)/;   // regular expr to extract the angle param from turn action

    for (let i = 0; i < extractedRules.length; i++) {
      lhs = extractedRules[i].LHS;
      rhs = extractedRules[i].RHS;
      righthandSides = rhs.split(',');  // split possibly multiple actions by comma
      actionsList = [];

      // for each of the actions associated with this symbol
      for (let j = 0; j < righthandSides.length; j++) {
        let action = righthandSides[j];

        if (action == "forward") {
          actionsList.push(() => {
            // always step forward by 10 --scale() will handle the rest
            line(0, STEP_LENGTH, 0, 0);
            translate(0, STEP_LENGTH);
          });

        } else if (action == "push") {
          actionsList.push(() => {
            push();
          });
  
        } else if (action == "pop") {
          actionsList.push(() => {
            pop();
          });

        } else if (turn.test(action)) {
          let match = action.match(turn);

          if (match.length < 2) {
            return cb(new Error(`Invalid use of turn syntax at "${lhs} : ${rhs}"`));
          }

          const angle = parseInt(match[1], 10);

          // ensure angle parsed successfully
          if (isNaN(angle)) {
            return cb(new Error(`Invalid argument to turn at "${lhs} : ${rhs}"`));
          }

          actionsList.push(() => {
            rotate(angle);
          });

        } else {
          return cb(new Error(`Invalid righthand side at: "${lhs} : ${rhs}". Must use a valid graphics command.`));
        }
      }

      // add all those funcs to actions for this symbol
      actionsTable[lhs] = actionsList;
    }

    cb(null, actionsTable);
  });
}

/*  extract the left- and righthand sides from 
    the raw text in the productions/actions inputs */
function parseRawText(rawText, cb) {
  if (rawText == "") return cb(new Error("There were no production rules entered!"));

  const split = rawText.split("\n");
  const ret = [];

  for (let i = 0; i < split.length; i++) {
    let line = split[i];
    let splitByColon = line.replace(/\s/g, '').split(":");

    if (line == '') continue; // ignore blank lines

    if (splitByColon.length != 2) {
      return cb(new Error(`The line "${line}" must have a single colon separating the lefthand side from the righthand side`));
    }

    let lhs = splitByColon[0], rhs = splitByColon[1];

    if (!lhs || !rhs) {
      return cb(new Error(`The line "${line}" errored: Both the left-hand side and right-hand side must be non-empty`));
    }

    if (lhs.length != 1) {
      return cb(new Error(`The line "${line}" errored: The left-hand side must be only one character`));
    }

    ret.push({
      LHS: splitByColon[0],
      RHS: splitByColon[1]
    });
  }

  cb(null, ret);
}


/* -------------------------------------------- */

// let c = new ContextRule("X", contexts.NULL, ["X", "F"]);

// let c1 = "A";
// let r1 = new ContextRule("0", "1", ["B"]);
// let r2 = new ContextRule(contexts.NULL, contexts.NULL, ["C"]);

// let c2 = "B";
// let r3 = new ContextRule("3", "3", ["A", "C"]);
// let r4 = new ContextRule(contexts.INITIAL, contexts.NULL, ["C"]);

// let c3 = "C";
// let r5 = new ContextRule("0", "2", ["A"]);
// let r6 = new ContextRule(contexts.NULL, "2", ["B"]);
// let r7 = new ContextRule(contexts.NULL, contexts.NULL, ["F"]);

// let p = new ProductionRules();

// p.addRule("A", r1);
// p.addRule("B", r3);
// p.addRule("A", r2);
// p.addRule("B", r4);

// p.addRule("C", r5);
// p.addRule("C", r6);
// p.addRule("C", r7);


/*

Axiom:
X

Productions:
0 < 0 > 0 --> 1
F --> FFF
  | FX
F < F > F --> XYZ | ZY

Graphics:
F = forward
V = foward 3
[ = push
] = pop
+ = {
  push;
  turn 120;
}
- = turn -120

*/



// const testRules = 
// `

// F : F-G+F+G-F

// G : GG
// V : F+F
// F : FG

// V : G-F+GG
// J:_FF_
// t : wowza


// `;

// const testActions =
// `+ : turn 120
// - : turn -18

// h:turn-190
// Z: turn 1

// F : forward

// G : forward
// ( : push
// ) : pop

// [ : push, turn -45
// `;

// parseProductionRules(testRules, (err, data) => {
//   console.log(err);
//   console.log(data);
// });

// parseActions(testActions, (err, data) => {
//   console.log(err);
//   console.log(data);

//   console.log(data['['].toString());
// });