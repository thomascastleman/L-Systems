/*
  globals.js: Global constants & variables
*/

const STEP_LENGTH = 15;   // length of turtle graphics "forward" movements

let lsys;       // the L-system itself
let lineColor;  // color of turtle graphics lines

// an enum of contexts
//  - NULL represents no context (matches with anything)
//  - INITIAL matches the beginning of the string
//  - FINAL matches the end of the string
const contexts = {
  NULL: 0,
  INITIAL: 1,
  FINAL: 2
};