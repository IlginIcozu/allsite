let sceneShader, postShader;
let pg; // Offscreen buffer
let orbitCount;
let orbitData = [];
let splitMain;
const MAX_ORBITS = 3;
const SPLIT_PROB = 0.2;
let spike = 0.0
let back = 1.0
let lightOn = false;
let chro, col;
let inver
let blurr
let co = 1
let rgbD, turnSpeed, flat

let pix = 1
var clickCount = 0


let feed = 0.0

let fmbFreq1, fmbFreq2, fmbAmp1, fmbAmp2;

function preload() {
    // 1) Your “scene” fragment shader (with orbits, split shapes, etc.)
    sceneShader = loadShader('shaderg.vert', 'shaderg.frag');
    // 2) The post-processing fragment shader (grain + rgb shift).
    postShader = loadShader('shaderg.vert', 'post.frag');
}

function setup() {

    pixelDensity(pix);
    let m = min(windowWidth, windowHeight)
    createCanvas(windowWidth, windowHeight, WEBGL);

    // Create an offscreen graphics buffer in WEBGL
    pg = createGraphics(windowWidth, windowHeight, WEBGL);
    pg.noStroke();
    pg.pixelDensity(pix);

    let seed = random() * 99999999999999


    // seed = 29161621761182.195



    randomSeed(seed)
    noiseSeed(seed)

    console.log(seed)

    // Decide how many small shapes (1..3)
    orbitCount = floor(random(1, MAX_ORBITS + 1));

    // Generate orbit parameters
    orbitData = [];
    for (let i = 0; i < orbitCount; i++) {
        let type = floor(random(0, 3)); // 0..2
        let r1 = random(1.0, 3.0);
        let r2 = random(0.5, 2.0);
        let sp = random(0.3, 1.0);
        let off = random(0, TWO_PI);
        let ang = random(0, TWO_PI);
        orbitData.push({
            orbitType: type,
            radius1: r1,
            radius2: r2,
            speed: sp,
            offset: off,
            angle: ang
        });
    }
    while (orbitData.length < MAX_ORBITS) {
        orbitData.push({
            orbitType: 0,
            radius1: 0.0,
            radius2: 0.0,
            speed: 0.0,
            offset: 0.0,
            angle: 0.0
        });
    }

    // Decide if main shape is split
    let r = random();
    splitMain = (r < SPLIT_PROB) ? 1 : 0;


    spike = 2.0 //random([2.0, 2.0, 2.0, 1.0, 2.0, 2.0, 2.0])

    fmbFreq1 = random([1.0, 2.0, 3.0, 4.0, 5.0])
    fmbFreq1 == 1.0 ? fmbFreq2 = 3.0 : fmbFreq2 = 2.0 // random([1.0, 2.0, 2.0, 2.0])
    fmbFreq1 == !3.0 ? fmbAmp1 = random(0.5, 0.8) : fmbAmp1 = 0.5
    fmbAmp2 = 0.5 //random([1.0, 0.5,0.5])

    chro = random([0.0, 0.0, 0.0, 0.5])

    chro = 0.0


    chro == 0.0 ? rgbD = random([0.0, 0.0, 0.0, 0.5]) : rgbD = 0.0



    console.log(rgbD)

    back = random([-1.0, 1.0, 1.0, 1.0])
    col = random([0.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0])

    inver = random([0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0])


    if (col !== 0.0) inver = 0.0

    blurr = 0.0

    if (col == 1.0 || col == 2.0) chro = 0, rgbD = 0

    turnSpeed = random([0.1, 0.2, 0.3, 0.4, 0.5, 0.55])

    flat = random([0.1, 0.2, 0.3])

    back = -1.0

    // if (inver == 3.0) back = 1

    if (back == -1.0) {
        mouseX = width / 2
        mouseY = height / 2
        noCursor();
        lightOn = true
    } else {
        mouseX = -width
        mouseY = -height
        lightOn = false
        cursor(CROSS)
    }

}

function draw() {
    // ---- PASS 1: Render SDF scene into offscreen buffer pg ----
    pg.shader(sceneShader);

    // Clear or set background so it re-renders each frame
    pg.clear();
    // Alternatively: pg.background(0); // black background

    // Pass all uniforms
    sceneShader.setUniform('u_resolution', [width * pix, height * pix]);
    sceneShader.setUniform('u_time', millis() * 0.001);
    sceneShader.setUniform('u_mouse', [mouseX * pix, mouseY * pix]);

    // random orbits
    let typesArr = [],
        rad1Arr = [],
        rad2Arr = [],
        spdArr = [],
        offArr = [],
        angArr = [];

    for (let i = 0; i < MAX_ORBITS; i++) {
        typesArr.push(orbitData[i].orbitType);
        rad1Arr.push(orbitData[i].radius1);
        rad2Arr.push(orbitData[i].radius2);
        spdArr.push(orbitData[i].speed);
        offArr.push(orbitData[i].offset);
        angArr.push(orbitData[i].angle);
    }

    sceneShader.setUniform('u_orbitCount', orbitCount);
    sceneShader.setUniform('u_orbitType', typesArr);
    sceneShader.setUniform('u_orbitRad1', rad1Arr);
    sceneShader.setUniform('u_orbitRad2', rad2Arr);
    sceneShader.setUniform('u_orbitSpeed', spdArr);
    sceneShader.setUniform('u_orbitOffset', offArr);
    sceneShader.setUniform('u_orbitAngle', angArr);
    sceneShader.setUniform('u_splitMain', splitMain);
    sceneShader.setUniform('u_spike', spike);
    sceneShader.setUniform('u_fmbFreq1', fmbFreq1);
    sceneShader.setUniform('u_fmbFreq2', fmbFreq2);
    sceneShader.setUniform('u_fmbAmp1', fmbAmp1);
    sceneShader.setUniform('u_fmbAmp2', fmbAmp2);
    sceneShader.setUniform('u_back', back);
    sceneShader.setUniform('u_lightOpen', lightOn ? 1 : 0);
    sceneShader.setUniform('u_col', col);
    sceneShader.setUniform('u_turnSpeed', turnSpeed);
    sceneShader.setUniform('u_flat', flat);






    // Full-screen quad in pg
    // We'll do rectMode(CENTER) to cover entire buffer
    pg.push();
    pg.rectMode(CENTER);
    pg.translate(0, 0, 0); // no shift
    pg.rect(0, 0, width, height); // fill entire offscreen
    pg.pop();

    // ---- PASS 2: Post-processing on main canvas ----
    shader(postShader);

    // pass the offscreen texture
    postShader.setUniform('u_sceneTex', pg);
    postShader.setUniform('u_resolution', [width * pix, height * pix]);
    postShader.setUniform('u_time', millis() * 0.001);
    postShader.setUniform('u_prevTex', pg);
    postShader.setUniform('u_chroAmount', chro);
    postShader.setUniform('u_inver', inver);
    postShader.setUniform('u_mouse', [mouseX, mouseY]);
    postShader.setUniform('u_blurr', blurr);
    postShader.setUniform('u_feed', feed);
    postShader.setUniform('u_rgbD', rgbD);


    // draw a full-screen quad
    rectMode(CENTER);
    rect(0, 0, width, height);

}

function windowResized() {
    let m = min(windowWidth, windowHeight)
    resizeCanvas(windowWidth, windowHeight);

    pg.resizeCanvas(windowWidth, windowHeight);
    // re-init orbits if you want a new random
    // or keep them the same.

}

function keyPressed() {
    // if (key === " ") {
    //   lightOn = !lightOn;
    // }
    if (key === "b") {
        co += 1
        if (co % 2 == 0) {
            blurr = 1.0
            //lightOn = !lightOn
        } else {
            blurr = 0.0
            //lightOn = !lightOn
        }
    }
}

function mousePressed() {
    clickCount++;
    back *= -1;
    lightOn = !lightOn
    if (back == -1.0) {
        noCursor();
    } else {
        cursor(CROSS)
    }



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
