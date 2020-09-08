/*
  library.js: Library of L-Systems we like
  From various sources:
  - https://en.wikipedia.org/wiki/L-system
  - http://paulbourke.net/fractals/lsys/
*/

/* ---------------------- Context-Sensitive ---------------------- */
const dragonCurve = {
  axiom: 
    'FX',
  productionRules: 
    `X ==> X+YF+\n` +
    `Y ==> -FX-Y\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn 90\n` +
    `- = turn -90\n`,
  iterations: 11
}

const recursiveTree = {
  axiom: 
    '0',
  productionRules: 
    `1 ==> 11\n` +
    `0 ==> 1[0]0`,
  graphics:
    `1 = forward\n` + 
    `0 = forward\n` +
    `[ = {\n` + 
      `  push\n` +
      `  turn -45\n` +
    `}\n` +  
    `] = {\n` + 
      `  pop\n` + 
      `  turn 45\n` + 
    `}`,
  iterations: 4
}

const kochCurve = {
  axiom: 
    'F',
  productionRules: 
    `F ==> F+F-F-F+F\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn -90\n` +
    `- = turn 90\n`,
  iterations: 3
}

const sierpinski = {
  axiom: 
    'F-G-G',
  productionRules: 
    `F ==> F-G+F+G-F\n` + 
    `G ==> GG`,
  graphics:
    `F = forward\n` + 
    `G = forward\n` + 
    `+ = turn -120\n` +
    `- = turn 120\n`,
  iterations: 5
}

const sierpinskiArrowheadCurve = {
  axiom: 
    'A',
  productionRules: 
    `A ==> B-A-B\n` + 
    `B ==> A+B+A`,
  graphics:
    `A = forward\n` + 
    `B = forward\n` + 
    `+ = turn -60\n` +
    `- = turn 60\n`,
  iterations: 6
}

const plant = {
  axiom: 
    'X',
  productionRules: 
    `X ==> F+[[X]-X]-F[-FX]+X\n` + 
    `F ==> FF`,
  graphics:
    `F = forward\n` + 
    `+ = turn 25\n` +
    `- = turn -25\n` +
    `[ = push\n` + 
    `] = pop\n`,
  iterations: 4
}

const christmasTree = {
  axiom: 
    'rF',
  productionRules: 
    `F ==> F[+FF][-FF]F[-F][+F]F\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn 25\n` +
    `- = turn -25\n` +
    `[ = push\n` + 
    `] = pop\n` + 
    `r = turn 180`,
  iterations: 3
}

const crystal  = {
  axiom: 
    'F+F+F+F',
  productionRules: 
    `F ==> FF+F++F+F\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn 90\n` +
    `- = turn -90\n` +
    `[ = push\n` + 
    `] = pop\n`,
  iterations: 3
}

const pentaplexity =  {
  axiom: 
    'F++F++F++F++F',
  productionRules: 
    `F ==> F++F++F*F-F++F\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn 36\n` +
    `- = turn -36\n` +
    `* = turn 180\n`,
  iterations: 3
}

const gosper =  {
  axiom: 
    'XF',
  productionRules: 
    `X ==> X+YF++YF-FX--FXFX-YF+\n` + 
    `Y ==> -FX+YFYF++YF+FX--FX-Y\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn 60\n` +
    `- = turn -60\n`,
  iterations: 4
}

const hilbert = {
  axiom: 'X',
  productionRules: 
    `X ==> +YF-XFX-FY+\n` + 
    `Y ==> -XF+YFY+FX-\n`,
  graphics:
    `F = forward\n` + 
    `+ = turn 90\n` + 
    `- = turn -90\n`,
  iterations: 5 
}

const islands = {
  axiom: 'F-F-F-F',
  productionRules:
    `F ==> F-f+FF-F-FF-Ff-FF+f-FF+F+FF+Ff+FFF\n` + 
    `f ==> ffffff\n`,
  graphics:
    `F = forward\n` + 
    `f = leap\n` + 
    `+ = turn 90\n` + 
    `- = turn -90\n`,
  iterations: 2
}

/* ---------------------- Context-Sensitive ---------------------- */
const tallPlant = {
  axiom: 'F0F1F1',
  ignore: '-+F][',
  productionRules: 
    `0 < 0 > 0 ==> 1\n` +
    `0 < 0 > 1 ==> 0\n` +
    `0 < 1 > 0 ==> 0\n` +
    `0 < 1 > 1 ==> 1F1\n` +
    `1 < 0 > 0 ==> 0\n` +
    `1 < 0 > 1 ==> 1[+F1F1]\n` +
    `1 < 1 > 0 ==> 1\n` +
    `1 < 1 > 1 ==> 0\n` +
    `- ==> +\n` +
    `+ ==> -\n`,
  graphics:
    `F = forward 0.3\n` +
    `+ = turn 24\n` +
    `- = turn -16\n` +
    `[ = push\n` +
    `] = pop\n`,
  iterations: 24
}