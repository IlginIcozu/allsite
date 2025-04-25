#version 300 es
precision highp float;

// Current rendered scene this frame
uniform sampler2D u_sceneTex;

// The previous frame’s result (to create feedback / trails)
uniform sampler2D u_prevTex;

// Canvas info
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_chroAmount;
uniform float u_inver;

// New uniform: mouse position (in pixels)
uniform vec2 u_mouse;
uniform float u_blurr;
uniform float u_feed;
uniform float u_rgbD;

// Varying from vertex shader
in vec2 vTexCoord;

// We'll output the final post-processed color
out vec4 outColor;

// A simple random function for grain
float rand(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898f, 78.233f))) * 43758.5453123f);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = rand(i);
    float b = rand(i + vec2(1.0f, 0.0f));
    float c = rand(i + vec2(0.0f, 1.0f));
    float d = rand(i + vec2(1.0f, 1.0f));
    vec2 u = f * f * (3.0f - 2.0f * f);
    float lerp1 = mix(a, b, u.x);
    float lerp2 = mix(c, d, u.x);
    return mix(lerp1, lerp2, u.y);
}

void main() {
    // 1) Read the current frame color from u_sceneTex
    vec2 uv = vTexCoord;

 // Get the original scene color
    vec3 original = texture(u_sceneTex, uv).rgb;
    vec3 c = original;

    if(u_feed == 1.0f) {
        vec3 prevColor = texture(u_prevTex, uv).rgb;

        float decay = 0.5f;
        prevColor *= decay;

        vec3 frameDifference = c - prevColor;

        vec2 motionVector = frameDifference.rg * 0.5f;

        vec2 moshUV = clamp(uv + motionVector, 0.0f, 1.0f);

        vec3 moshColor = texture(u_prevTex, moshUV).rgb;

        float feedbackAmount = 0.98f;
        c = mix(c, moshColor, feedbackAmount);
    }

    float offset = 1.0f / min(u_resolution.x, u_resolution.y);
    float aberrationAmount = 0.005f; // intensity
    vec2 aberrationOffset = vec2(aberrationAmount, 0.0f);

    float r = texture(u_prevTex, uv - (offset/2.0) + aberrationOffset).r;
    float g = texture(u_prevTex, uv - (offset/2.0)).g;
    float b = texture(u_prevTex, uv - (offset/2.0) - aberrationOffset).b;

// // 13) Solarize
// float threshold = 0.5;
// if(c.r > threshold) c.r = 1.0 - c.r;
// if(c.g > threshold) c.g = 1.0 - c.g;
// if(c.b > threshold) c.b = 1.0 - c.b;

// // 14) Tint
// vec3 tintColor = vec3(0.0f, 0.47f, 1.0f);
// float tintAmount = 0.1;
// c = mix(c, tintColor, tintAmount);

// 18) Kaleidoscope
// uv = abs(uv - 0.5) + 0.5; 
// c = texture(u_sceneTex, uv).rgb;

// --- Compute blurred version ---
    if(u_blurr == 1.0f) {
        vec3 blur = vec3(0.0f);
        float radius = 2.0f;
        vec2 texel = 1.0f / u_resolution;
        int count = 0;
        for(int i = -1; i <= 5; i++) {
            for(int j = -1; j <= 5; j++) {
                blur += texture(u_sceneTex, uv + vec2(float(i), float(j)) * texel * radius).rgb;
                count++;
            }
        }
        blur /= float(count);
        vec2 mouseUV = u_mouse / u_resolution;
        float d = distance(uv, mouseUV);
        float mask = smoothstep(0.1f, 0.3f, d);
        c = mix(original, blur, mask);
    }


// Offset only the red channel to create a chromatic glitch and blend it in
    vec2 redOffset = vec2(0.005f * sin(u_time * 1.0f), 0.0f);
    float rChannel = texture(u_sceneTex, uv + redOffset).r;
    float gChannel = texture(u_sceneTex, uv).g;
    float bChannel = texture(u_sceneTex, uv).b;
    vec3 effectSample = vec3(rChannel, gChannel, bChannel);
    c = mix(c, effectSample, u_rgbD);

    vec3 chro = vec3(r, g, b);
    // Light blend with current color
    c = mix(c, chro, u_chroAmount);

    if(u_inver == 0.0f) {
        c += vec3(0.002f);
    } else if(u_inver == 1.0f) {
        if(uv.x < 0.5f) {
            c = 1.0f - c;
        }
    } else if(u_inver == 2.0f) {
        if(uv.y < 0.5f) {
            c = 1.0f - c;
        }
    } else if(u_inver == 3.0f) {

        c = 1.0f - c; // invert colors
    }

// // 22) Random block inversion
// vec2 blockCoord = floor(uv*5.0);
// float rh = rand(blockCoord);
// if(rh>0.5) { c = 1.0 - c; }

    float grainAmount = 0.06f;
    // Use vTexCoord for a stable pattern
    c += rand(uv) * grainAmount;
    c -= 0.03f;

    c = clamp(c, 0.0f, 1.0f);

    outColor = vec4(c, 1.0f);
}
