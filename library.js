/*
  library.js: Library of L-Systems that we like
  From: https://en.wikipedia.org/wiki/L-system
*/

const dragonCurve = {
  axiom: 
    'FX',
  productionRules: 
    `X : X+YF+\n` +
    `Y : -FX-Y\n`,
  actions:
    `F : forward\n` + 
    `+ : turn 90\n` +
    `- : turn -90\n`,
  iterations: 11
}

const recursiveTree = {
  axiom: 
    '0',
  productionRules: 
    `1 : 11\n` +
    `0 : 1[0]0`,
  actions:
    `1 : forward\n` + 
    `0 : forward\n` +
    `[ : push, turn -45\n` + 
    `] : pop, turn 45\n`,
  iterations: 4
}

const kochCurve = {
  axiom: 
    'F',
  productionRules: 
    `F : F+F-F-F+F\n`,
  actions:
    `F : forward\n` + 
    `+ : turn -90\n` +
    `- : turn 90\n`,
  iterations: 3
}

const sierpinski = {
  axiom: 
    'F-G-G',
  productionRules: 
    `F : F-G+F+G-F\n` + 
    `G : GG`,
  actions:
    `F : forward\n` + 
    `G : forward\n` + 
    `+ : turn -120\n` +
    `- : turn 120\n`,
  iterations: 5
}

const sierpinskiArrowheadCurve = {
  axiom: 
    'A',
  productionRules: 
    `A : B-A-B\n` + 
    `B : A+B+A`,
  actions:
    `A : forward\n` + 
    `B : forward\n` + 
    `+ : turn -60\n` +
    `- : turn 60\n`,
  iterations: 6
}

const plant = {
  axiom: 
    'X',
  productionRules: 
    `X : F+[[X]-X]-F[-FX]+X\n` + 
    `F : FF`,
  actions:
    `F : forward\n` + 
    `+ : turn 25\n` +
    `- : turn -25\n` +
    `[ : push\n` + 
    `] : pop\n`,
  iterations: 4
}

// from: http://paulbourke.net/fractals/lsys/
const christmasTree = {
  axiom: 
    'rF',
  productionRules: 
    `F : F[+FF][-FF]F[-F][+F]F\n`,
  actions:
    `F : forward\n` + 
    `+ : turn 25\n` +
    `- : turn -25\n` +
    `[ : push\n` + 
    `] : pop\n` + 
    `r : turn 180`,
  iterations: 3
}

const crystal  = {
  axiom: 
    'F+F+F+F',
  productionRules: 
    `F : FF+F++F+F\n`,
  actions:
    `F : forward\n` + 
    `+ : turn 90\n` +
    `- : turn -90\n` +
    `[ : push\n` + 
    `] : pop\n`,
  iterations: 3
}

const pentaplexity =  {
  axiom: 
    'F++F++F++F++F',
  productionRules: 
    `F : F++F++F|F-F++F\n`,
  actions:
    `F : forward\n` + 
    `+ : turn 36\n` +
    `- : turn -36\n` +
    `| : turn 180\n`,
  iterations: 3
}

const gosper =  {
  axiom: 
    'XF',
  productionRules: 
    `X : X+YF++YF-FX--FXFX-YF+\n` + 
    `Y : -FX+YFYF++YF+FX--FX-Y\n`,
  actions:
    `F : forward\n` + 
    `+ : turn 60\n` +
    `- : turn -60\n`,
  iterations: 4
}