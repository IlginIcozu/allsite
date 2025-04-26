// sketch.js
let theShader;
let jiggle = 0.0;

// old and target values
let oldRad, newRad;
let oldGrad, newGrad;
let oldAmp, newAmp;
let oldFreq, newFreq;
let oldLight, newLight;

// when params() was last called
let lastFrame = 0;
let interval = 8000;
var clickCount = 0

function preload() {
  theShader = loadShader('shaderf.vert', 'shaderf.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  buffer = createGraphics(width, height, WEBGL);
  buffer.noStroke();

  // initialize both old & new so there's no jump on first draw
  let init = getRandomParams();
  oldRad = newRad = init.rad;
  oldGrad = newGrad = init.grad;
  oldAmp = newAmp = init.amp;
  oldFreq = newFreq = init.freq;
  oldLight = newLight = init.light;
  
  lastFrame = frameCount;
}

function draw() {
  background(0);
  const t = millis() * 0.001;


  if ((frameCount - lastFrame) >= interval) {
    // shift new→old, then generate fresh new
    oldRad   = newRad;
    oldGrad  = newGrad;
    oldAmp   = newAmp;
    oldFreq  = newFreq;
    oldLight = newLight;

    let p = getRandomParams();
    newRad   = p.rad;
    newGrad  = p.grad;
    newAmp   = p.amp;
    newFreq  = p.freq;
    newLight = p.light;

    lastFrame = frameCount;
  }

  // figure out how far into the first half of the interval we are
  let halfInterval = interval / 6;
  let elapsed = frameCount - lastFrame;
  let norm = constrain(elapsed / halfInterval, 0, 1);

  // apply an easing curve (smoothstep)
  let e = norm * norm * (3 - 2 * norm);

  // interpolate each parameter
  let rad   = lerp(oldRad,   newRad,   e);
  let grad  = lerp(oldGrad,  newGrad,  e);
  let amp   = lerp(oldAmp,   newAmp,   e);
  let freq  = lerp(oldFreq,  newFreq,  e);
  let light = lerp(oldLight, newLight, e);

  // send uniforms
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform('u_prev', buffer);
  theShader.setUniform('u_time', t);
  theShader.setUniform('u_jiggle', jiggle);
  theShader.setUniform('u_mouse', [mouseX/width, mouseY/height]);
  theShader.setUniform('u_rad', rad);
  theShader.setUniform('u_grad', grad);
  theShader.setUniform('u_amp', amp);
  theShader.setUniform('u_freq', freq);
  theShader.setUniform('u_light', light);

  // bind & draw
  buffer.shader(theShader);
  buffer.rect(-width / 2, -height / 2, width, height);
  image(buffer, -width / 2, -height / 2, width, height);

  // exponential decay of jiggle so it can be reset on every click

}

function mousePressed() {
  clickCount++;

  if (clickCount === 1) {

    // 2) Hide the HTML overlay
    let overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
} else if (clickCount === 2) {

    // window.open("https://ilginicozu.com", "_blank");
}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buffer.resizeCanvas(windowWidth, windowHeight);
}

// helper to pick a fresh batch of randomized params
function getRandomParams() {
  return {
    rad: random(0.01, 0.7),
    grad: random([0.9,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1]),
    amp: random([0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]),
    freq: random([2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0]),
    light: random(0.05, 2.5)
  };
}
