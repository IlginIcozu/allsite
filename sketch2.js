let basicShader;
let shaderTexture;
let randT, colorFreq, rseed;
let dir = 1; // Current direction
let targetDir = 1; // Target direction to interpolate to
let transitionStartTime = 0; // Time when the transition started
let transitionDuration = 10000; // 2 seconds (in milliseconds)
let count = 0
var clickCount = 0

let mousePressedTime = 0;
let mousePressPosition = [0, 0];
let mousePressedFlag = false;
let numColors = 2; // Start with 2 colors
const maxColors = 4; // Maximum number of colors in the palette

const maxShaderDrops = 50; // Maximum number of color drops
let colorDrops = []; // Array to store color drops
let paletteColors = []; // Array to store the current color palette

let tex, cols, grid, clear

let isMousePressed = false; // Flag to track if the mouse is pressed
let chro


const scale = ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4'];
const scale2 = ['A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'];
const ti = ['1n', '2n', '3n', '4n', '6n', '8n', '1n', '32n', '32n', '4n', '2n'];

let newScale

let synth1, synth2, synth3;
let reverb, delay, lowpassFilter;
let isAudioInitialized = false;
let vol1, vol2, vol3, masterVol;
let freqChange
let tarz
let scl

let overlayActive = true;

let or = 0.0;

function preload() {
    // Load the shaders
    basicShader = loadShader('shader.vert', 'shader2.frag');
}

function setup() {
    let c = max(windowWidth, windowHeight)
    createCanvas(windowWidth, windowHeight, WEBGL);

    let seed = random() * 999999;

    // seed = 457972.1825840292
    // seed = 357759.1089240597
    // seed = 380488.62928752345

    randomSeed(seed);
    noiseSeed(seed);

    tarz = random([1.0, 0.0])
    randomSeed(seed);
    noiseSeed(seed);

    let fundemantal = random(["c", "d", "e", "f", "g", "a", "b"])
    let octave = random(["5", "3", "4", "5"])
    newScale = Tonal.Scale.get(fundemantal + octave + " minor pentatonic").notes;


    console.log(Tonal.ScaleType.names())
    console.log(seed)
    randomSeed(seed);
    noiseSeed(seed);

    let pixSha = random([1, 1, 1, 2, 2, 1, 1, 1])

    shaderTexture = createGraphics(windowWidth, windowHeight, WEBGL);
    shaderTexture.noStroke();
    shaderTexture.pixelDensity(1);

    pixelDensity(1);
    noStroke();

    randT = random(1);
    rseed = random(1);
    colorFreq = random(0.5, random([5.0, 3.0, 4.0, 8.0]));
    tex = random([1.0, 2.0, 4.0]) ////4 tehlikeli gibi
    cols = random([0.0, 1.0, 2.0, 4.0, 5.0])
    grid = random([1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 2.0, 3.0])
    clear = random([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 1.0, 2.0, 10.0])

    scl = random([10.0, 20.0, 20.0, 500.0, 500.0, 1000.0])
    // cols = 1.0
    // clear = 10.0
    // tex = 2.0
    colorFreq = 1.7
    grid = 3.0


    console.log("clear: " + clear)

    chro = random([.1, .8, .3, .4, .5, .5, .6, .7, .8, .9, .9])






    // **Initialize the palette based on cols value**
    if (cols === 0.0) {
        paletteColors = [
            [0.8, 0.2, 0.6], // Vibrant purple
            [0.35, 0.25, 0.55], // Vibrant green
            [0.2, 0.4, 0.8], // Vibrant blue
            [1.0, 0.6, 0.2] // Vibrant orange
        ];
    } else if (cols === 1.0) {
        paletteColors = [
            [0.129, 0.145, 0.161], // #212529
            [0.204, 0.227, 0.251], // #343A40
            [0.424, 0.459, 0.490], // #6C757D
            [0.678, 0.71, 0.741] // #ADB5BD
        ];
    } else if (cols === 2.0) {
        paletteColors = [
            [0.039, 0.035, 0.031], // Dark tone
            [0.133, 0.2, 0.231], // Greenish tone
            [0.918, 0.878, 0.835], // Light tone
            [0.776, 0.675, 0.561] // Earth tone
        ];
    } else if (cols === 3.0) {
        paletteColors = [
            [0.749, 0.741, 0.757], // Grayish purple
            [0.427, 0.416, 0.459], // Dark purple
            [0.216, 0.196, 0.243], // Deep purple
            [0.871, 0.722, 0.255] // Golden
        ];
    } else if (cols === 4.0) {
        paletteColors = [
            [0.0, 0.278, 0.467], // Blue
            [0.639, 0.0, 0.0], // Red
            [1.0, 0.467, 0.0], // Orange
            [0.937, 0.824, 0.553] // Light brown
        ];
    } else if (cols === 5.0) {
        paletteColors = [
            [0.855, 0.824, 0.847], // Light purple
            [0.078, 0.212, 0.259], // Dark greenish
            [0.059, 0.545, 0.553], // Greenish blue
            [0.925, 0.604, 0.161] // Orange
        ];
    }

    dir = random([-1, 1, 1, 1])

}

function draw() {


    let elapsedTime2 = millis() / 1000.0 - mousePressedTime;

    if (elapsedTime2 > 2.0) {
        mousePressedFlag = false;
    }

    let dropPositions = [];
    let dropColors = [];
    let latestDrops = colorDrops.slice(-maxShaderDrops);

    for (let i = 0; i < maxShaderDrops; i++) {
        if (i < latestDrops.length) {
            dropPositions.push(latestDrops[i].position);
            dropColors.push(latestDrops[i].color);
        } else {
            dropPositions.push([0.0, 0.0]);
            dropColors.push([0.0, 0.0, 0.0]);
        }
    }

    basicShader.setUniform('u_dropPositions', dropPositions.flat());
    basicShader.setUniform('u_dropColors', dropColors.flat());
    basicShader.setUniform('u_numDrops', latestDrops.length);
    basicShader.setUniform('u_cols', cols);
    basicShader.setUniform('u_pixelDensity', pixelDensity());
    basicShader.setUniform('img', shaderTexture);
    basicShader.setUniform('u_resolution', [width, height]);
    basicShader.setUniform('u_time', millis() / 1000.0);
    basicShader.setUniform('u_speed', 1);
    basicShader.setUniform('u_windSpeed', 1.0);
    basicShader.setUniform('u_mouse', [mouseX, height - mouseY]);
    basicShader.setUniform('u_middle', [width, height]);
    basicShader.setUniform('u_t', randT);
    basicShader.setUniform('u_colorFreq', colorFreq);
    basicShader.setUniform('u_randomSeed', rseed);
    basicShader.setUniform('u_dir', dir); /////////////////////////////////direction
    basicShader.setUniform('u_tex', tex);
    basicShader.setUniform('u_grid', grid);
    basicShader.setUniform('u_clear', clear);
    basicShader.setUniform('u_mousePressTime', mousePressedTime);
    basicShader.setUniform('u_mousePressPosition', mousePressPosition);
    basicShader.setUniform('u_mousePressed', mousePressedFlag ? 1.0 : 0.0);
    basicShader.setUniform('u_numColors', numColors);
    basicShader.setUniform('u_chro', chro);
    basicShader.setUniform('u_orientation', or);
    basicShader.setUniform('u_bloomIntensity', 0.1);
    basicShader.setUniform('u_bloomThreshold', 0.7);
    basicShader.setUniform('u_tarz', tarz);
    basicShader.setUniform('u_scl', scl);




    shaderTexture.shader(basicShader);
    shaderTexture.rect(0, 0, width, height);

    // rotate(PI / 2)
    translate(-width / 2, -height / 2);
    image(shaderTexture, 0, 0);





}

function mousePressed() {

    // if (overlayActive) {
    //     initializeAudio(); // start audio on first click
    //     document.getElementById('overlay').style.display = 'none';
    //     overlayActive = false;
    //     return; // skip rest of mousePressed
    // }

    clickCount++;

    if (clickCount === 1) {
        initializeAudio(); // start audio on first click

        // 2) Hide the HTML overlay
        let overlay = document.getElementById("overlay");
        if (overlay) {
            overlay.style.display = "none";
        }
    } else if (clickCount === 2) {

        // window.open("https://ilginicozu.com", "_blank");
    }

    targetDir *= -1;
    transitionStartTime = millis();

    mousePressedTime = millis() / 1000.0; // Record the time in seconds
    mousePressPosition = [mouseX / width, (height - mouseY) / height]; // Normalize mouse position
    mousePressedFlag = true; // Set the flag to true

    let mouseXNorm = mouseX / width;
    let mouseYNorm = 1.0 - mouseY / height;

    let randomColor = random(paletteColors);

    colorDrops.push({
        position: [mouseXNorm, mouseYNorm],
        color: randomColor
    });

    if (count == 0) initializeAudio();

    count += 1



}

function keyPressed() {
    if (key === 'r') {
        colorDrops = [];
    }
    if (key === 's') {

    }

    if (key === 'o') {
        or = (or + 1.0) % 2.0; // Toggle between 0.0 and 1.0
    }

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, WEBGL);
    shaderTexture.resizeCanvas(windowWidth, windowHeight, WEBGL);
}



function initializeAudio() {
    if (!isAudioInitialized) {
        Tone.start().then(() => {
            console.log('Audio initialized');
            isAudioInitialized = true;
            // Start your generative music here
            setupMusic();
        });
    }
}

function setupMusic() {

    reverb = new Tone.Reverb({
        decay: 50,
        preDelay: 0.01,
        wet: 0.9
    }).toDestination();

    // const reverb = new Tone.JCReverb(0.7).toDestination();

    delay = new Tone.FeedbackDelay({
        delayTime: '5n',
        feedback: 0.8,
        wet: 0.2
    }).connect(reverb);

    lowpassFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 300, // Initial cutoff frequency
        Q: 1
    }).connect(delay);

    // Create volume controls for each synth and the master output
    vol1 = new Tone.Volume(-12).connect(lowpassFilter); // Initial volume for synth1
    vol2 = new Tone.Volume(-12).connect(lowpassFilter); // Initial volume for synth2
    vol3 = new Tone.Volume(-12).connect(lowpassFilter); // Initial volume for synth3
    masterVol = new Tone.Volume(-6).toDestination(); // Master volume

    // Create synths
    synth1 = new Tone.MonoSynth("sine").connect(vol1);
    synth2 = new Tone.MonoSynth("saw").connect(vol2);
    synth3 = new Tone.FMSynth().connect(vol3);
    synth4 = new Tone.MembraneSynth().connect(vol3);




    const chorus = new Tone.Chorus({
        frequency: 12,
        delayTime: 50,
        depth: 0.5
    }).toDestination();

    const autoWah = new Tone.AutoWah(50, 6, -30).toDestination();

    delay.connect(masterVol);

    // autoWah.connect(masterVol);


    // Start the loop
    startLoops();
}

function startLoops() {
    // Loop for synth1
    Tone.Transport.scheduleRepeat(time => {
        playRandomNote(synth1, time);
    }, '4n');

    // Loop for synth2
    Tone.Transport.scheduleRepeat(time => {
        playRandomNote(synth2, time);
    }, '3n');

    // Loop for synth3
    Tone.Transport.scheduleRepeat(time => {
        playRandomNote(synth3, time);
    }, '2n');

    // Loop for synth4
    Tone.Transport.scheduleRepeat(time => {
        playRandomNote(synth4, time);
    }, '1n');

    // Start the transport
    Tone.Transport.bpm.value = random([40, 50, 60, 90, 100, 120, 140, 160, 220, 40, 60]); // Slow tempo
    Tone.Master.volume.value = -12
    Tone.Transport.start();
}

function getQuantizedTime() {
    // Get the current transport time
    let now = Tone.Transport.seconds;
    // Get the next quantized times for each layer
    let time1 = Tone.Transport.nextSubdivision('16n');
    let time2 = Tone.Transport.nextSubdivision('12n');
    let time3 = Tone.Transport.nextSubdivision('8n');

    // Choose the nearest time
    let times = [time1, time2, time3];
    let nearestTime = times.reduce((prev, curr) => Math.abs(curr - now) < Math.abs(prev - now) ? curr : prev);

    return nearestTime;
}

function playRandomNote(synth, time) {
    let note = random(newScale);
    let relTime = random(ti)
    freqChange = random([300, 410, 500, 370, 1000, 600, 350, 320, 400])
    lowpassFilter.frequency.value = freqChange
    synth.triggerAttackRelease(note, relTime, time);
}

function touchStarted() {
    mousePressed();
}
