#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359
const float PHI = 1.61803398874989484820459;
const float SEED = 43758.0;

uniform float u_time;               // Time uniform for animation
uniform vec2 u_resolution;          // Resolution uniform for aspect ratio
uniform vec2 u_mouse;               // Mouse position for interactivity
uniform sampler2D img;
uniform float u_t;
uniform float u_colorFreq;
uniform float u_randomSeed;
uniform float u_dir;
uniform float u_tex;
uniform float u_cols;
uniform float u_grid;
uniform float u_clear;
uniform float u_mousePressTime;
uniform vec2 u_mousePressPosition;
uniform float u_mousePressed;
uniform vec2 u_dropPositions[50];  // Positions of color drops
uniform vec3 u_dropColors[50];     // Colors of color drops
uniform int u_numDrops;            // Number of active color drops
uniform float u_chro;
uniform sampler2D u_prevFrame;     // Previous frame texture for feedback loop
uniform float u_orientation;
uniform float u_tarz;
uniform float u_scl;

uniform float u_bloomIntensity;    // Add to JS: value: 0.1
uniform float u_bloomThreshold;    // Add to JS: value: 0.7

// ——— New saturation control uniform ———
uniform float u_saturation;        // 0 = fully desaturated, 1 = original color

// Random function
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Smooth noise function using fractional Brownian motion (fBM)
// float noise(vec2 st) {
//     vec2 i = floor(st);
//     vec2 f = fract(st);
//     vec2 u = f * f * (3.0 - 2.0 * f);
//     return mix(
//         mix(rand(i), rand(i + vec2(1.0, 0.0)), u.x),
//         mix(rand(i + vec2(0.0, 1.0)), rand(i + vec2(1.0, 1.0)), u.x),
//         u.y
//     );
// }


float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(vec2 x) {
	vec2 i = floor(x);
	vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));


	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}


float ridgedFBM(vec2 st) {
    float total = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 100; i++) {
        float n = 1.0 - abs(noise(st * frequency) * 2.0 - 1.0);
        total += n * amplitude;
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return total;
}

float noised(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(rand(i), rand(i + vec2(1.0, 0.0)), u.x),
        mix(rand(i + vec2(0.0, 1.0)), rand(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// fbm (fractional Brownian motion) function to add layers of noise
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.8;
    vec2 shift = vec2(10.0);
    for(int i = 0; i < 100; i++) {
        value += amplitude * noise(st);
        st = st * 2.0 + shift;
        amplitude *= 0.6;
    }
    return value;
}

float moirePattern(vec2 uv, float scale) {
    return sin((uv.x + uv.y) * scale) * sin((uv.x - uv.y) * scale);
}

// Vibrant color gradient function based on a noise value
vec3 colorGradient(float t) {
    vec3 col1;
    vec3 col2;
    vec3 col3;
    vec3 col4;

    if(u_cols == 0.0) {
        col1 = vec3(0.8, 0.2, 0.6);    // #CC3399
        col2 = vec3(0.35, 0.25, 0.55); // #593F8C
        col3 = vec3(0.2, 0.4, 0.8);    // #3366CC
        col4 = vec3(1.0, 0.6, 0.2);    // #FF9933
    } else if(u_cols == 1.0) {
        col1 = vec3(0.129, 0.145, 0.161); // #212529
        col2 = vec3(0.204, 0.227, 0.251); // #343A40
        col3 = vec3(0.424, 0.459, 0.490); // #6C757D
        col4 = vec3(0.678, 0.71, 0.741);  // #ADB5BD
    } else if(u_cols == 2.0) {
        col1 = vec3(0.039, 0.035, 0.031); // #0A0A0A
        col2 = vec3(0.133, 0.2, 0.231);   // #223334
        col3 = vec3(0.918, 0.878, 0.835); // #EBD9D5
        col4 = vec3(0.776, 0.675, 0.561); // #C6AC90
    } else if(u_cols == 3.0) {
        col1 = vec3(0.749, 0.741, 0.757); // #BFBDC1
        col2 = vec3(0.427, 0.416, 0.459); // #6D6A75
        col3 = vec3(0.216, 0.196, 0.243); // #37323E
        col4 = vec3(0.871, 0.722, 0.255); // #DEB841
    } else if(u_cols == 4.0) {
        col1 = vec3(0.0, 0.278, 0.467);   // #004777
        col2 = vec3(0.639, 0.0, 0.0);     // #A30000
        col3 = vec3(1.0, 0.467, 0.0);     // #FF7700
        col4 = vec3(0.937, 0.824, 0.553); // #EFD28D
    } else if(u_cols == 5.0) {
        col1 = vec3(0.855, 0.824, 0.847); // #DAD2D8
        col2 = vec3(0.078, 0.212, 0.259); // #143642
        col3 = vec3(0.059, 0.545, 0.553); // #0F8B8D
        col4 = vec3(0.925, 0.604, 0.161); // #EC9A29
    }

    float permutation = mod(floor(u_randomSeed * 6.0), 6.0);
    vec3 c1, c2, c3, c4;

    if(permutation < 1.0) {
        c1 = col1; c2 = col2; c3 = col3; c4 = col4;
    } else if(permutation < 2.0) {
        c1 = col1; c2 = col3; c3 = col2; c4 = col4;
    } else if(permutation < 3.0) {
        c1 = col1; c2 = col4; c3 = col2; c4 = col3;
    } else if(permutation < 4.0) {
        c1 = col2; c2 = col1; c3 = col3; c4 = col4;
    } else if(permutation < 5.0) {
        c1 = col2; c2 = col3; c3 = col1; c4 = col4;
    } else {
        c1 = col2; c2 = col4; c3 = col1; c4 = col3;
    }

    if(t < 0.33) {
        return mix(c1, c2, t * 3.0);
    } else if(t < 0.66) {
        return mix(c2, c3, (t - 0.33) * 3.0);
    } else {
        return mix(c3, c4, (t - 0.66) * 3.0);
    }
}

vec2 computeDisplacement(vec2 uv, float time) {
    float noiseScale = 500.0;
    float noiseSpeed = 0.1 * (u_dir * -1.0);
    float displacementStrength = 0.0005;
    float n = fbm(uv * noiseScale + time * noiseSpeed);
    float angle = n * PI * 2.0;
    return vec2(cos(angle), sin(angle)) * displacementStrength;
}

float grain(vec2 uv) {
    return rand(uv);
}

// ——— New helper to adjust saturation ———
vec3 adjustSaturation(vec3 color, float saturation) {
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(lum), color, saturation);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Displacement
    vec2 displacement = computeDisplacement(uv, u_time);
    vec2 displacedUV = uv + displacement;
    vec2 sortedUV = displacedUV;
    float sortValue = rand(displacedUV);
    sortedUV.x = mix(displacedUV.x, sortValue, 0.01);

    // Grain & distortion
    float g = fbm(sortedUV * u_clear);
    float distortion = noise(vec2(sortedUV.x, sortedUV.y) * 5.0 - (u_time * 0.5) * u_dir);
    sortedUV += vec2(distortion * 0.05);

    // Blend factor
    float blendScale = u_grid;
    float timeScale = u_scl;
    float blendFactor = noise(uv * blendScale * timeScale);

    // Final pattern
    float finalPattern;
    if(u_tex == 1.0 || u_tex == 2.0) {
        finalPattern = mix(g, distortion, 0.5 * (blendFactor * u_colorFreq));
    } else {
        finalPattern = mix(g, distortion, 0.5 + (blendFactor * u_colorFreq));
    }

    // Base color
    vec3 c = colorGradient(finalPattern);

    // Color drops
    for(int i = 0; i < 50; i++) {
        if(i >= u_numDrops) break;
        vec2 dp = u_dropPositions[i];
        vec3 dc = u_dropColors[i];
        float d = length(uv - dp);
        float influence = smoothstep(0.2, 0.0, d);
        c = mix(c, dc, influence);
    }

    // Datamosh feedback
    vec3 prevColor = (u_tarz < 0.5)
        ? texture2D(img, uv).rgb
        : texture2D(img, uv * noised(uv * 4.0)).rgb;
    vec2 motionVector = (c - prevColor).rg * 0.005;
    vec3 moshColor = texture2D(img, mod(uv + motionVector, 1.0)).rgb;
    c = mix(c, moshColor, 0.95);
    c = clamp(c, 0.0, 1.0);

    // Additional noise & chromatic aberration
    float randomOffset = rand(sortedUV) * 30.02;
    c += texture2D(img, sortedUV - randomOffset).rgb * 0.05;
    c -= texture2D(img, sortedUV * sortedUV).rgb * 0.06;

    float offset = 1.0 / min(u_resolution.x, u_resolution.y);
    vec2 aberr = vec2(0.008, 0.0);
    float r = texture2D(img, uv - offset + aberr).r;
    float g2 = texture2D(img, uv - offset).g;
    float b2 = texture2D(img, uv - offset - aberr).b;
    c = mix(c, vec3(r, g2, b2), 0.05);

    c += rand(uv) * 0.06;
    c -= 0.03;
    c += vec3(0.002);

    // ——— Apply saturation control ———
    c = adjustSaturation(c, 0.9);

    gl_FragColor = vec4(c, 1.0);
}
