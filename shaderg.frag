#version 300 es
precision highp float;

// Final output color
out vec4 outColor;

// Uniforms
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Orbit data
uniform int u_orbitCount;
uniform int u_orbitType[3];
uniform float u_orbitRad1[3];
uniform float u_orbitRad2[3];
uniform float u_orbitSpeed[3];
uniform float u_orbitOffset[3];
uniform float u_orbitAngle[3];
uniform float u_spike;
uniform float u_fmbFreq1;
uniform float u_fmbFreq2;
uniform float u_fmbAmp1;
uniform float u_fmbAmp2;
uniform float u_back;
uniform int u_lightOpen; // 1 = light on, 0 = light off
uniform float u_col;
uniform float u_turnSpeed;
uniform float u_flat;

// New uniform: split or not
uniform int u_splitMain; // 0 => single shape, 1 => splitted shape

//-------------------------------------------
// 1) HSV → RGB 
//-------------------------------------------
vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

//-------------------------------------------
// 2) Noise & FBM
//-------------------------------------------
float rand(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - u_spike * f);
    float lerp1 = mix(a, b, u.x);
    float lerp2 = mix(c, d, u.x);
    return mix(lerp1, lerp2, u.y);
}
float fbm(vec2 st) {
    float value = 0.0;
    float amp = u_fmbAmp1;
    float freq = u_fmbFreq1;
    for(int i = 0; i < 5; i++) {
        value += amp * noise(st * freq);
        freq *= u_fmbFreq2;
        amp *= u_fmbAmp2;
    }
    return value;
}

//-------------------------------------------
// 3) smoothMin 
//-------------------------------------------
float smoothMin(float d1, float d2, float k) {
    float h = max(k - abs(d1 - d2), 0.0) / k;
    return min(d1, d2) - h * h * h * (k / 6.0);
}

//-------------------------------------------
// 4) A single big shape
//-------------------------------------------
float sdfMainShape(vec3 p, float time) {
    float radius = 1.5;
    float dist = length(p) - radius;
    float warp = fbm(p.xy * 2.0 + time * u_turnSpeed) * u_flat;
    dist += warp;
    return dist;
}

// If "split," we do 2 shapes on left & right
// each with radius=1.2 for instance
float sdfMainShapeLeft(vec3 p, float time) {
    float r = 1.1;
    // shift left: e.g. p.x+=1.0 => sphere center at x=-1
    vec3 c = p + vec3(1.25, 0.0, 0.0);
    float dist = length(c) - r;
    float warp = fbm(c.xy * 2.0 + time * u_turnSpeed) * u_flat;
    dist += warp;
    return dist;
}
float sdfMainShapeRight(vec3 p, float time) {
    float r = 1.1;
    // shift right: p.x-=1 => center at x=+1
    vec3 c = p - vec3(1.25, 0.0, 0.0);
    float dist = length(c) - r;
    float warp = fbm(c.xy * 2.0 + time * u_turnSpeed) * u_flat;
    dist += warp;
    return dist;
}

//-------------------------------------------
// 5) ORBITING small shape
//-------------------------------------------
vec3 orbitCenter(
    float t,
    int orbitType,
    float rad1,
    float rad2,
    float speed,
    float offset,
    float angle
) {
    if(orbitType == 0) {
        // circle
        float orbitAng = t * speed + offset;
        float x = rad1 * sin(orbitAng);
        float y = rad1 * cos(orbitAng);
        float z = 0.2 * sin(t * 0.9 + offset);
        return vec3(x, y, z);
    } else if(orbitType == 1) {
        // ellipse
        float orbitAng = t * speed + offset;
        float ex = rad1 * cos(orbitAng);
        float ey = rad2 * sin(orbitAng);
        float cx = cos(angle);
        float sy = sin(angle);
        float newx = ex * cx - ey * sy;
        float newy = ex * sy + ey * cx;
        float z = 0.2 * sin(t * 0.9 + offset);
        return vec3(newx, newy, z);
    } else {
        // line
        float pos = sin(t * speed + offset) * rad1;
        float cx = cos(angle);
        float sy = sin(angle);
        float newx = pos * cx;
        float newy = pos * sy;
        float z = 0.2 * sin(t * 0.5 + offset * 2.0);
        return vec3(newx, newy, z);
    }
}

float sdfOneOrbit(
    vec3 p,
    float time,
    int orbitType,
    float rad1,
    float rad2,
    float speed,
    float offset,
    float angle
) {
    float r = 0.5;
    vec3 c = orbitCenter(time, orbitType, rad1, rad2, speed, offset, angle);
    float dist = length(p - c) - r;
    float warp2 = fbm((p.xy - c.xy) * 2.0 + time * 0.5) * 0.3;
    dist += warp2;
    return dist;
}

//-------------------------------------------
// 6) Combine main shape(s) + orbits
//-------------------------------------------
float mapScene(vec3 p, float time) {
    float dAll = 0.0;
    // If splitMain==1 => two shape union
    // else => single shape
    if(u_splitMain == 1) {
        float dl = sdfMainShapeLeft(p, time);
        float dr = sdfMainShapeRight(p, time);
        // union the left & right main shape
        float dMain = smoothMin(dl, dr, 0.5);

        // now union with orbits
        dAll = dMain;
    } else {
        // single shape
        dAll = sdfMainShape(p, time);
    }

    // union with each orbit shape
    for(int i = 0; i < 3; i++) {
        if(i < u_orbitCount) {
            float dOrbit = sdfOneOrbit(p, time, u_orbitType[i], u_orbitRad1[i], u_orbitRad2[i], u_orbitSpeed[i], u_orbitOffset[i], u_orbitAngle[i]);
            dAll = smoothMin(dAll, dOrbit, 0.5);
        }
    }

    return dAll;
}

//-------------------------------------------
// 7) Light from mouse
//-------------------------------------------
vec3 getLightPosition(vec2 mouse, vec2 resolution) {
    // X remains the same
    float nx = (mouse.x / resolution.x) * 2.0 - 1.0;

    // Remove the 1.0- inversion for Y-axis
    float ny = 1.0 - (mouse.y / resolution.y) * 2.0;

    float scaleXY = 2.0;
    nx *= scaleXY;
    ny *= scaleXY;

    // Keep Z-depth calculation unchanged
    float distCenter = length(vec2(nx, ny));
    float cornerDist = 3.0;
    float t = clamp(distCenter / cornerDist, 0.0, 1.0);
    float z = mix(-2.0, -0.5, t) * u_back;

    return vec3(nx, ny, z);
}

//-------------------------------------------
// 8) Normals
//-------------------------------------------
float mapSceneWrapper(vec3 p, float time) {
    return mapScene(p, time);
}
vec3 getNormal(vec3 p, float time) {
    float d = mapSceneWrapper(p, time);
    float e = 0.001;///1.001
    float dx = mapSceneWrapper(vec3(p.x + e, p.y, p.z), time) - d;
    float dy = mapSceneWrapper(vec3(p.x, p.y + e, p.z), time) - d;
    float dz = mapSceneWrapper(vec3(p.x, p.y, p.z + e), time) - d;
    return normalize(vec3(dx, dy, dz));
}

float sdfMouseLight(vec3 p, vec2 uv, float time) {
    // If the light is closed, return a large distance so it is effectively ignored.
    if(u_lightOpen == 0) {
        return 1000.0;
    }
    vec3 lightPos = getLightPosition(u_mouse, u_resolution);
    float radius = 0.1; // Desired radius of the circle
    float dis = length(p - lightPos) - radius;
    float warp = fbm(uv.xy * 10.0 + time * 0.2) * 0.03;
    return dis + warp;
}

//-------------------------------------------
// 9) Main: volumetric accumulation + shading
//-------------------------------------------
void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= (u_resolution.x / u_resolution.y);

    float time = u_time;

    vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
    vec3 d = normalize(vec3(uv, 1.0));

    vec3 col = vec3(0.0);
    float totalDist = 0.0;
    float e = 0.0;
    const int MAX_STEPS = 64;
    const float HIT_THRESH = 0.002;

    int hitStep = -1;
    vec3 hitPos = vec3(0.0);

    bool isMouseShape = false;
    // Ray march
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = rayOrigin + d * totalDist;
        float e_scene = mapScene(p, time);
        float e_mouse = sdfMouseLight(p, uv, time);
        float e = min(e_scene, e_mouse);

        if(e == e_scene) {
            float s = float(i);
            float brightness = min(e_scene * s, 0.9 - e_scene) / 35.0;
            if(u_col == 0.0) {
                col += hsv(0.1, 0.2, brightness);
            } else if(u_col == 1.0) {
                col += hsv(0.0, 1.0, brightness);
            } else if(u_col == 2.0) {
                col += hsv(0.1, 1.0, brightness);
            }

        }

        if(abs(e) < HIT_THRESH) {
            hitStep = i;
            hitPos = p;
            isMouseShape = (e == e_mouse);
            break;
        }
        totalDist += e * 0.5;

        if(totalDist > 50.0) {
            break;
        }
    }

    // If we actually hit => shading
    if(hitStep > -1) {
        if(isMouseShape) {
        // White emissive light source
            // col = vec3(1.0f);

             // Compute the light position in scene space.
            vec3 lightPos = getLightPosition(u_mouse, u_resolution);
            float distFromCenter = length(lightPos.xy);
            float factor = 1.0 - smoothstep(1.0, 3.0, distFromCenter);
            col = vec3(factor);
        } else {
            vec3 normal = getNormal(hitPos, time);
            vec3 lightPos = getLightPosition(u_mouse, u_resolution);
            vec3 toLight = normalize(lightPos - hitPos);

            float diff = max(dot(normal, toLight), 0.0);
            float ambient = 0.1;
            float intensity = 2.5;
            col *= (diff + ambient) * intensity;
        }
    } else {
    }


    outColor = vec4(col, 1.0);
}
