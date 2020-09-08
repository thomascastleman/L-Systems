/*
  sketch.js: Main p5.js setup and draw
*/

let BG;
let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('z-index', '-1');
  canvas.position(0, 0);
  canvas.mouseWheel(e => { Controls.zoom(controls).worldZoom(e); renderLSys(); })
  
  setLineColor();
  setBGColor();

  angleMode(DEGREES);
  stroke(lineColor);
  strokeWeight(2);

  // situate the L system near the righthand side of the window
  controls.view.x = 0.65 * width;
  controls.view.y = height * (5 / 6);

  if (!lsys) {
    lsys = new Lsystem(); // initialize the L-system
    loadLibraryItem(plant);	// default to plant
  }
}

// render the L system wherever it needs to be
function renderLSys() {
  stroke(lineColor);
  background(BG);
  push();
    translate(controls.view.x, controls.view.y);
    rotate(180);
    scale(controls.view.zoom);
    lsys.drawLsys();
  pop();
}

// download the canvas as a PNG image
function downloadLsys() {
  let name = prompt('Please enter a file name', `L_system.png`);

  if (!name) {
    return;
  }

  save(canvas, name);
}

// resize the canvas/re-render anytime the window size is changed
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  renderLSys();
}