// shader.frag
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_jiggle;
uniform vec2 u_mouse;
uniform float u_rad;
uniform float u_grad;
uniform float u_amp;
uniform float u_freq;
uniform float u_light;
uniform float u_exp;
uniform float u_col;
uniform float u_sin;
uniform float u_offs;
uniform float u_sel;
#define CONTRAST 1.05    // contrast control

// Flame parameters
#define RADIUS         u_rad
#define GRADIENT       u_grad
#define SCROLL_SPEED   0.095
#define FLICKER_INT    0.1
#define FLICKER_SPEED  1.0

// Turbulence parameters
#define TURB_NUM    5.0
#define TURB_AMP   u_amp
#define TURB_FREQ   u_freq
#define TURB_EXP    u_exp

// Simple value noise
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noiseValue(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    float a = rand(ip);
    float b = rand(ip + vec2(1.0, 0.0));
    float c = rand(ip + vec2(0.0, 1.0));
    float d = rand(ip + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 2x2 rotation helper
mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Noise-based turbulence
vec2 turbulence(vec2 p) {
    float freq = TURB_FREQ;
    float jig = u_jiggle * sin(u_time * 20.0) / 10.0;
    mat2 rot = mat2(0.6, -0.8, 0.8, 0.6);
    for(float i = 0.0; i < TURB_NUM; i++) {
        float n = noiseValue(p * freq + u_time * 0.1 + i);
        float disp = n * 2.0 - 1.0;
        p.x += jig;

        float wave = sin(p.y * 10.0 + u_time * 1.0) * 0.02;
        // p.x += wave;
        p += TURB_AMP * rot[0] * disp / freq;
        rot = rot2(0.3) * rot;
        freq *= TURB_EXP;
    }
    return p;
}

void main() {
    // Normalize to [-1,1] and aspect-correct
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    float g = rand(uv)/5.0;
    // Vertical expand/stretch
    float xstretch = 3.0 - 1.25 * smoothstep(-0.2, 0.2, uv.y);
    float ystretch = 0.2 - 1.0 / (1.0 + uv.x * uv.x);
    vec2 stretch = vec2(xstretch, ystretch);
    uv *= stretch;

    // Scroll flame upward
    float scroll = SCROLL_SPEED * u_time;
    uv.y -= scroll;

    // Apply turbulence with jiggle
    vec2 t = turbulence(uv);
    t.y += scroll;

    // Add horizontal sine wave displacement varying by vertical position
    float wave = sin(u_offs+ u_time * 0.5 + uv.y * u_sin) * 0.25;
    
    if(u_sel == 0.0) {
     t /= vec2(t.x + wave, t.y - wave);
     t *= vec2(t.x + wave, t.y - wave);
    }else if(u_sel == 1.0) {
    t += vec2(t.x + wave, t.y - wave);
    t *= vec2(t.x + wave, t.y - wave);
    }else{

    }




    



    // t2.x += sin( u_jiggle) * 2.0;

    // Compute lighting with modified t2
    vec2 local = t;
    local.y *= stretch.y;
    float dist = length(local) - RADIUS;
    float light = u_light / pow(dist * dist + GRADIENT * max(t.y + 0.5, 0.20), 3.0);
    vec2 source = t + vec2(0.0, 3.0 * RADIUS) * stretch;
    vec3 grad = 0.07 / (1.0 + u_col * length(source) / vec3(9.0, 3.0, 1.0));

    // Flicker
    float ft = FLICKER_SPEED * u_time;
    float flicker = 1.0 + FLICKER_INT * cos(ft + sin(ft * 1.618 - t.y)) ;
    vec3 ambient = 5.2 * flicker * grad / (1.0 + dot((uv - vec2(0.0, scroll)), (uv - vec2(0.0, scroll)))) ;

    // Combine and tone-map
    vec3 col = ambient + light * grad;
    col = 0.95 - exp(-col);

    // Monochrome with contrast
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    gray = (gray - 0.5) * CONTRAST + 0.5;

    // col = 1.0 - col;


    col = mix(col, vec3(g),0.2);

    
    gl_FragColor = vec4(vec3(col), 1.0);
}
