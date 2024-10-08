#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

layout (location = 0) out vec2 coord;

void main()
{
    float x = (gl_VertexIndex << 1) & 2;
    float y = gl_VertexIndex & 2;
    coord = vec2(x, y);
    gl_Position = vec4(vec2(-1.0f, -1.0f) + 2.0f * coord, 0.0f, 1.0f);
}
