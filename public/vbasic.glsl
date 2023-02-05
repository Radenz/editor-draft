/**
Memory layout:
0000-0008: vPosition        [8 bytes,  2 floats]
0008-0014: vColor           [12 bytes, 3 floats]
0014-001C: vParentPosition  [8 bytes,  2 floats]
001C-0020: vParentRotation  [4 bytes,  1 float]
0020-0024: vParentScale     [4 bytes,  1 float]

Vertex size: (36 bytes)
*/

attribute vec2 vPosition;
attribute vec3 vColor;
attribute vec2 vParentPosition;
attribute float vParentRotation;
attribute float vParentScale;

varying vec4 fColor;

vec2 rotate(in vec2 position, in float angle) {
  return mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * position;
}

void main() {
  vec2 position = vParentPosition + rotate(vPosition * vParentScale, vParentRotation);
  gl_Position = vec4(position, 0., 1.);
  fColor = vec4(vColor, 1);
}