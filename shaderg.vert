#version 300 es
precision mediump float;

// These attributes come from p5
in vec3 aPosition;
in vec2 aTexCoord;

// We'll pass the texcoords on to the fragment shader
out vec2 vTexCoord;

// p5 automatically sets these two uniforms
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
  // Pass the texture coordinates to the fragment shader
  vTexCoord = aTexCoord;

  // Project the vertex position using p5's camera and projection
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
