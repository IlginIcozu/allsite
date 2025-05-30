
let w;
let h
let pix = 1
let s, c, pg, pg2, img, sh
let f, g
let frameMod

let borderStr

let border
let blockColor, blockColor2, blockColor3
let stopCount = 1
let far
let blockW, blockH
let yatayChooser
let sChooser

let ellipseChooser
let akChooser
let dirChooser
let borderBox
let newi
let lineDir

let notes
let randomNote

let finalFrame;
let analysisPG; 
let prevFrame; 
let flickerSh; 



let kickOsc, kickEnv, kickFilter;
let snareOsc, snareEnv, snareFilter;
let percOsc, percEnv, percFilter;
let percOsc2, percEnv2, percFilter2;
let synthOsc, synthEnv, synthFilter;
let hitToggle = 0;
let pitchShifter
let aksak, noiseOsc, noiseOscFilter
let aksakNoise, aksak2, envMult
let flick = false

let highpf
let lowpf
let masterGain
let currentFilter = null;

let brightnessSh;
let brightnessPG;

let overlayActive = true; 
var clickCount = 0; 


function preload() {
  brightnessSh = loadShader('flicker.vert', 'brightness.frag');
  sh = loadShader("pix.vert", "pix.frag");
  flickerSh = loadShader("flicker.vert", "flicker.frag"); 
  seed1 = 999999999 * random(1)
}



function setup() {
  pixelDensity(pix)
  w = windowWidth
  h = windowHeight

  c = createCanvas(w, h, WEBGL)
  
  f = createGraphics(w, h)
  f.pixelDensity(pix)
  f.colorMode(HSB, 360, 100, 100, 1)
  pg = createGraphics(w, h)
  pg.pixelDensity(pix)
  pg.noStroke()

  f.background(0, 0, 10)

  pg2 = createGraphics(w, h)
  pg2.pixelDensity(pix)
  pg2.noStroke()

  img = createGraphics(w, h)
  img.pixelDensity(pix)
  img.imageMode(CENTER)
  img.colorMode(HSB, 360, 100, 100, 1)
  img.rectMode(CENTER)

  f.rectMode(CENTER)


  finalFrame = createGraphics(width, height);
  finalFrame.pixelDensity(1);

  analysisPG = createGraphics(32, 32, WEBGL);
  analysisPG.pixelDensity(1);

  brightnessPG = createGraphics(32, 32, WEBGL);
  brightnessPG.pixelDensity(1);

  prevFrame = createGraphics(width, height);
  prevFrame.pixelDensity(1);

  prevFrame.background(0);


  let r = random([0,1,2,3])

  if(r == 0){
    seed1 = 99802705.52943894
  }else if(r == 1){
    seed1 = 470272973.6459138

  }else if(r == 2){

    seed1 = 151326186.59319073
  }else if(r == 3){
    seed1 = 793301208.642165
  }



  console.log(seed1)
  noiseSeed(seed1)
  randomSeed(seed1)



  let frArr = [25, 50, 75, 50, 25, 50, 75, 50, 50, 75]
  frameMod = 64 

  far = 30
  frameRate(far)

  introCanvas();

  initSetup();

  audioSetup();

  aksak = 16
  aksakNoise = 4
  aksak2 = 32

  envMult = 1
}


function draw() {

  

  let x = (random(w / s) ^ (frameCount / s)) * s
  let y = (random(h / s) ^ (frameCount / s)) * s

  for (let i = 0; i < 3; i += 1) {
    pg.fill(random([0, 255, 127]), random([0, 255, 127]), random([0, 255, 127]))
    pg.rect(x, y, s * 2, s * 2)

    pg2.fill(random([0, 255, 127]), random([0, 255, 127]), random([0, 255, 127]))
    pg2.rect(x, y, s * 2, s * 2)
  }

  if (border == 1.0) {
    pg2.push()
    pg2.fill(blockColor, blockColor2, blockColor3)
    pg2.rectMode(CENTER)
    if (yatayChooser == 0.0) {
      pg2.push()
      pg2.translate(blockW, height / 2)
      pg2.rect(0, 0, width / 10, height)
      pg2.pop()

      pg2.push()
      pg2.translate(blockW - width / 5, height / 2)
      pg2.rect(0, 0, width / 10, height)
      pg2.pop()

      pg2.push()
      pg2.translate(blockW + width / 5, height / 2)
      pg2.rect(0, 0, width / 10, height)
      pg2.pop()

    } else if (yatayChooser == 1.0) {
      pg2.push()
      pg2.translate(width / 2, blockH)
      pg2.rect(0, 0, width, height / 10)
      pg2.pop()

      pg2.push()
      pg2.translate(width / 2, blockH - height / 5)
      pg2.rect(0, 0, width, height / 10)
      pg2.pop()

      pg2.push()
      pg2.translate(width / 2, blockH + height / 5)
      pg2.rect(0, 0, width, height / 10)
      pg2.pop()
    }
    pg2.pop()
  }

  c.image(img, w / 2, h / 2)
  img.image(c, w / 2, h / 2)

  if (frameCount % frameMod == 0) {

    minDim = min(width, height)

    sChooser = random([1.0, 2.0, 3.0])
    ellipseChooser = random([0.0, 0.0, 1.0, 0.0])

    if (frameMod == 25) {
      akChooser = random([1, 2])
    } else {
      akChooser = random([1, 2, 3, 4, 1, 2])
    }

    dirChooser = random([1.0, 2.0, 3.0])
    border = random([0.0, 0.0, 1.0, 0.0, 0.0])
    yatayChooser = random([0.0, 1.0])
    lineDir = random([0.0, 1.0])

    if (sChooser == 1.0) {
      s = random([minDim / 10, minDim / 5, minDim / 20, minDim / 10, minDim / 50])
    } else if (sChooser == 2.0) {
      s = random([minDim / 50, minDim / 20, minDim / 50, minDim / 20])
    } else if (sChooser == 3.0) {
      s = random([minDim / 10, minDim / 5, minDim / 10, minDim / 5])
    }

    for (let y = 0; y < h; y += s) {
      for (let x = 0; x < w; x += s) {
        pg2.fill(random([0, 255, 127]), random([0, 255, 127]), random([0, 255, 127]))
        if (ellipseChooser == 0.0) {
          pg2.rect(x, y, s, s)
        } else {
          pg2.ellipse(x, y, s, s)
        }
      }
    }

    if (akChooser == 1.0) {
      sh.setUniform('ak', random([1., 1., 2.0, 1., 1., 2.0, 3., 1., 1., 1.]))
    } else if (akChooser == 2.0) {
      sh.setUniform('ak', 3.0)
    } else if (akChooser == 3.0) {
      sh.setUniform('ak', 5.0)
    } else if (akChooser == 4.0) {
      sh.setUniform('ak', 10.0)
    }

    let dX = random([1., -1., 0.0, 0.0])
    let dY
    if (dX == 1. || dX == -1) {
      dY = 0.0
    } else {
      dY = random([-1, 1])
    }
    if (dirChooser == 1.0) {
      sh.setUniform('dirX', dX)
      sh.setUniform('dirY', dY)
    } else if (dirChooser == 2.0) {
      sh.setUniform('dirX', random([-1., 1.]))
      sh.setUniform('dirY', random([-1., 1.]))
    } else if (dirChooser == 3.0) {
      sh.setUniform('dirX', random([-1., 1., 0., 0., 0.]))
      sh.setUniform('dirY', random([-1., 1., 0., 0., 0.]))
    }
    sh.setUniform('u_lineDir', lineDir)

    blockColor = random([255, 127])
    blockColor2 = random([255, 127])
    blockColor3 = random([255, 127])

    blockW = random([width / 2, width / 4, width / 1.3333])
    blockH = random([height / 2, height / 4, height / 1.3333])

 
    notes = ["D5", "F5", "A5", "D6"];
    randomNote = random(notes);

 

    aksak = random([16, 16, 16, 24, 24, 24, 24, 12, 8, 16, 16, 16])


    if (s == minDim / 50) {
      kickEnv.decay = 0.01
      snareOsc.envelope.attack = 0.001
      snareOsc.envelope.decay = 0.001
      envMult = 5
      percEnv.attack = 0.00005
      percEnv.decay = 0.00002
      percOsc.volume.value = 5;
      noiseOsc.volume.value = -18;
      snareOsc.volume.value = 5;
      randomNote = "A5"
    } else if (s == minDim / 20) {
      kickEnv.decay = 0.1
      snareOsc.envelope.attack = 0.005
      snareOsc.envelope.decay = 0.01
      envMult = 2
      percEnv.attack = 0.00005
      percEnv.decay = 0.00002
      percOsc.volume.value = 5;
      noiseOsc.volume.value = -20;
      snareOsc.volume.value = -3;
      randomNote = "D5"
    } else if (s == minDim / 10) {
      kickEnv.decay = 0.2
      snareOsc.envelope.attack = 0.01
      snareOsc.envelope.decay = 0.1
      envMult = 1
      percEnv.attack = 0.0005
      percEnv.decay = 0.0002
      percOsc.volume.value = -3;
      noiseOsc.volume.value = -22;
      snareOsc.volume.value = -9;
      randomNote = "A4"
    } else if (s == minDim / 5) {
      kickEnv.decay = 0.2
      snareOsc.envelope.attack = 0.01
      snareOsc.envelope.decay = 0.1
      envMult = 1
      percEnv.attack = 0.0005
      percEnv.decay = 0.0002
      percOsc.volume.value = -3;
      noiseOsc.volume.value = -22;
      snareOsc.volume.value = -9;
      randomNote = "D4"
    }


    if (dirChooser == 1.0) {
      aksak = random([12, 8, 16, 16])
      synthFilter.frequency = "16n"
    } else if (dirChooser == 2.0) {
      aksak = random([16, 16, 16, 12, 16, 16, 12])
      synthFilter.frequency = "12n"
    } else if (dirChooser == 3.0) {
      aksak = random([16, 16, 16, 24, 24, 24, 24])
      synthFilter.frequency = "8n"
    }


    aksakNoise = random([4, 4, 4, 4, 4, 4, 4])

    aksak2 = random([32, 16, 32, 16, 24, 24, 12, 12, 16, 32, 32, 32])

  }

  sh.setUniform('u_time', frameCount / 10.0)
  sh.setUniform('pg', pg2)
  sh.setUniform('img', img)
  sh.setUniform('pg2', pg2)

  quad(-1, -1, 1, -1, 1, 1, -1, 1)

  frameAnalysis()

  if (Tone.context.state == "running") {

    if (frameCount % aksak == 0) {
      kickEnv.triggerAttackRelease("8n");
    }

    if (frameCount % aksak2 == 0) {
      if (random() < 0.9) {
        snareOsc.triggerAttackRelease("8n");
        snareFilter.frequency.value = random(500, 800) * 4
      }
    }


    if (frameCount % 4 == 0) {
      if (random() < 0.6) {
        percEnv.triggerAttackRelease("32n");
        percFilter.frequency.value = random(1000, 5000)
      }
    }



    if (frameCount % aksakNoise == 0) {
      if (random() < 0.6) {
        noiseOsc.triggerAttackRelease("32n");
        noiseOsc.envelope.decay = random([0.1, 0.1, 0.1, 0.9, 0.45, 0.1]) / envMult
      }
    }


    if (ellipseChooser == 1.0) {
      if (frameCount % 4 == 0) {
        if (random() < 0.9) {

          synthOsc.triggerAttackRelease(randomNote, "32n");
        }
      }
    }
  }



}

function mousePressed() {
  clickCount++;

  if (clickCount === 1) {
    // 1) Start audio context if not running
    if (Tone.context.state !== "running") {
      Tone.start().then(() => {
        console.log("Audio context started!");
      });
    }

    // 2) Hide the HTML overlay
    let overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  } 
  else if (clickCount === 2) {
  
    // window.open("https://ilginicozu.com", "_blank");
  }


}

function keyPressed() {
  if (key == ' ') {
    stopCount += 1
    if (stopCount % 2 == 0) {
      frameRate(0)
    } else {
      frameRate(far)
    }
  }
  if (key == "s") {
    saveCanvas("strained", "png")
  }
}


function introCanvas() {
  f.push();
  f.rectMode(CENTER)
  f.fill(0, 0, 50);
  f.rect(w / 2, h / 2, w * 2, h * 2)


  f.push();
  f.rectMode(CENTER)
  f.fill(0, 0, 50);
  f.rect(w / 2, h / 2, w * 2, h * 2)
  minDim = min(width, height)
  f.push();
  translate(-width / 2, -height / 2)
  let si = minDim / 20
  for (let x = 0; x <= width; x += si) {
    if (random() < 0.8) noStroke()
    for (let y = 0; y <= height; y += si) {

      f.fill(0, 0, random(30, 65))
      f.rect(x, y, si - x, si - x)


    }
  }
  f.pop();


  f.pop();
}


function audioSetup() {

  kickOsc = new Tone.Oscillator("B1", "sine").start();
  kickEnv = new Tone.AmplitudeEnvelope({
    attack: 0.001,
    decay: 0.2,
    sustain: 0.0,
    release: 0.1,
  });
  kickFilter = new Tone.Filter({
    frequency: 100,
    type: "lowpass",
    rolloff: -24
  });
  kickOsc.connect(kickFilter);
  kickFilter.connect(kickEnv);


  snareOsc = new Tone.NoiseSynth({
    noise: {
      type: "white", 
    },
    envelope: {
      attack: 0.005,
      decay: 0.01, 
      sustain: 0.0, 
      release: 1.0, 
    },
  })

  snareFilter = new Tone.Filter({
    frequency: 1500,
    type: "bandpass",
    rolloff: -12,
    Q: 1
  });
  snareOsc.volume.value = -9;
  snareOsc.connect(snareFilter);




  percOsc = new Tone.Oscillator("G3", "triangle").start();
  percEnv = new Tone.AmplitudeEnvelope({
    attack: 0.0005,
    decay: 0.0002,
    sustain: 0.0,
    release: 0.1,
  });
  percFilter = new Tone.Filter({
    frequency: 1200,
    type: "lowpass",
    rolloff: -24
  });
  percOsc.volume.value = 3;
  percOsc.connect(percFilter);
  percFilter.connect(percEnv);
  



  percOsc2 = new Tone.Oscillator("G5", "sawtooth").start();
  percEnv2 = new Tone.AmplitudeEnvelope({
    attack: 0.005,
    decay: 0.002,
    sustain: 0.0,
    release: 0.01,
  });
  percFilter2 = new Tone.Filter({
    frequency: 6200,
    type: "highpass",
    rolloff: -24
  });
  percOsc2.volume.value = -4;
  percOsc2.connect(percFilter2);
  percFilter2.connect(percEnv2);


  noiseOsc = new Tone.NoiseSynth({
    noise: {
      type: "white", 
    },
    envelope: {
      attack: 0.0005,
      decay: 0.1, 
      sustain: 0.0, 
      release: 1.0, 
    },
  })

  noiseOscFilter = new Tone.Filter({
    frequency: 15000,
    type: "lowpass",
    rolloff: -12,
    Q: 1
  });
  noiseOsc.volume.value = -22;
  noiseOsc.connect(noiseOscFilter);


  synthOsc = new Tone.DuoSynth({
    voice0: {
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.005, 
        decay: 0.0005, 
        sustain: 0.0, 
        release: 1.5, 
      },
    },
    voice1: {
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.001, 
        decay: 0.001,
        sustain: 0.0,
        release: 1.0,
      },
    },
  });


  synthFilter = new Tone.AutoFilter({
    frequency: "8n", 
    depth: 1.0, 
    baseFrequency: 100, 
    octaves: 4, 
    filter: {
      type: "lowpass",
      rolloff: -24, 
      Q: 1, 
    },
  }).start()
  synthOsc.volume.value = -18;

  synthFilter.type = "sine";

  pitchShifter = new Tone.PitchShift({
    pitch: 24, 
    windowSize: 0.5, 
    delayTime: 0.01, 
    feedback: 0.01, 
  });

  synthOsc.connect(synthFilter)



  const reverb = new Tone.Reverb({
    decay: 2, 
    preDelay: 0.01, 
    wet: 0.5, 
  });

 

  synthFilter.connect(reverb)
 
  reverb.toDestination()


  highpf = new Tone.Filter({
    frequency: 1000,
    type: "highpass",
    rolloff: -24,
  }).toDestination();

  lowpf = new Tone.Filter({
    frequency: 500,
    type: "lowpass",
    rolloff: -24,
  }).toDestination();


  masterGain = new Tone.Gain().toDestination();


  kickEnv.connect(masterGain);
  snareFilter.connect(masterGain); // Snare's final filter
  percEnv.connect(masterGain); // Percussion 1
  percEnv2.connect(masterGain); // Percussion 2
  noiseOscFilter.connect(masterGain); // Noise Synth's final filter
  synthFilter.connect(masterGain); // Synth's final filter

}

function frameAnalysis() {

  finalFrame.push();
  finalFrame.clear();

  finalFrame.drawingContext.drawImage(
    c.elt, 
    0, 0, width, height 
  );
  finalFrame.pop();


  analysisPG.push();
  analysisPG.clear();
  analysisPG.shader(flickerSh);

  flickerSh.setUniform('u_currentFrame', finalFrame);
  flickerSh.setUniform('u_prevFrame', prevFrame);
  flickerSh.setUniform('u_resolution', [width, height]);


  analysisPG.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  analysisPG.pop();

  analysisPG.loadPixels(); 
  let r = analysisPG.pixels[0]; 
  if (r > 80) {

    console.log("Flicker detected!");
    flick = true
    if (Tone.context.state == "running") {
      if (frameCount % 2 == 0) {
        if (random() < 0.9) {
          percEnv2.triggerAttackRelease("64n");
        }
      }
    }
  } else {
    flick = false
  }


  brightnessPG.push();
  brightnessPG.clear();
  brightnessPG.shader(brightnessSh);


  brightnessSh.setUniform('u_frame', finalFrame);
  brightnessSh.setUniform('u_resolution', [width, height]);

  brightnessPG.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  brightnessPG.pop();

  brightnessPG.loadPixels();
  let pix = brightnessPG.pixels;
  let sumBright = 0;
  let numPixels = 32 * 32; 

  for (let i = 0; i < pix.length; i += 4) {
    let val = pix[i];
    sumBright += val;
  }
  let avgBright = sumBright / numPixels;

  if (avgBright > 190) {
    console.log("Mostly White Canvas");
    if (currentFilter !== highpf) {
      // Switch to HPF
      if (Tone.context.state == "running") {
        masterGain.disconnect();
        masterGain.connect(highpf);
        currentFilter = highpf;
      }
    }
  } else if (avgBright < 30) {
    console.log("Mostly Black Canvas");
    if (currentFilter !== lowpf) {

      if (Tone.context.state == "running") {
        masterGain.disconnect();
        masterGain.connect(lowpf);
        currentFilter = lowpf;
      }
    }
  } else {
    if (currentFilter !== null) {

      if (Tone.context.state == "running") {
        masterGain.disconnect();
        masterGain.toDestination();
        currentFilter = null;
      }
    }
  }


  prevFrame.push();
  prevFrame.image(c, 0, 0, width, height);
  prevFrame.pop();

}

function initSetup() {

  minDim = min(width, height)

  sChooser = random([1.0, 2.0, 3.0, 1.0]) 
  if (sChooser == 1.0) {
    s = minDim / 10
  } else if (sChooser == 2.0) {
    s = minDim / 50
  } else if (sChooser == 3.0) {
    s = minDim / 20
  }

  ellipseChooser = random([0.0, 0.0, 1.0, 0.0, 0.0]) 
  ellipseChooser = 0

  if (frameMod == 25) {
    akChooser = random([1, 2])
  } else {
    akChooser = random([1, 2, 3, 4, 1, 2])
  }

  dirChooser = random([1.0, 2.0, 3.0, 3.0])

  let dX = random([1., -1., 0.0, 0.0])
  let dY
  if (dX == 1. || dX == -1) {
    dY = 0.0
  } else {
    dY = random([-1, 1])
  }

  let proD = random([.1, .5])
  lineDir = random([0.0, 1.0])

  shader(sh)
  sh.setUniform('resolution', [w * pix, h * pix])
  sh.setUniform('pg', pg2)
  sh.setUniform('pg2', pg2)
  sh.setUniform('img', f)
  sh.setUniform('proD', proD)
  sh.setUniform('u_lineDir', lineDir)

  if (dirChooser == 1.0) {
    sh.setUniform('dirX', dX) 
    sh.setUniform('dirY', dY)
  } else if (dirChooser == 2.0) {
    sh.setUniform('dirX', random([-1., 1.])) 
    sh.setUniform('dirY', random([-1., 1.]))
  } else if (dirChooser == 3.0) {
    sh.setUniform('dirX', random([-1., 1., 0., 0., 0.])) 
    sh.setUniform('dirY', random([-1., 1., 0., 0., 0.]))
  }

  if (akChooser == 1.0) {
    sh.setUniform('ak', 1.)
  } else if (akChooser == 2.0) {
    sh.setUniform('ak', 3.0)
  } else if (akChooser == 3.0) {
    sh.setUniform('ak', 5.0)
  } else if (akChooser == 4.0) {
    sh.setUniform('ak', 10.0)
  }

  sh.setUniform('satOn', dirChooser)

  img.image(f, w / 2, h / 2)

  blockColor = 255
  blockColor2 = 255
  blockColor3 = 255

  blockW = width / 2
  blockH = height / 2
  blockAni = random([0.0, 1.0])

  border = random([0.0, 0.0, 1.0, 1.0, 0.0])
  if (border == 1.0) borderStr = "border"
  yatayChooser = random([0.0, 1.0])
}

function touchStarted() {
  mousePressed();
}
