#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "common.h"

layout (binding = 0, set = 0) uniform AppData
{
    UniformParams Params;
};

layout (binding = 1) uniform sampler2D inColor;

layout (location = 0) in vec2 TexCoord;

layout (location = 0) out vec4 outColor;

const float gamma = 1.0;

void main()
{
    vec3 color = textureLod(inColor, TexCoord, 0).rgb;
    vec3 mapped = color / (color + vec3(1.0));
    mapped = pow(mapped, vec3(1.0 / gamma));

    vec3 clamped = clamp(color, vec3(0.0f), vec3(1.0f));

    outColor = vec4(clamped * int(!Params.useTonemap) + mapped * int(Params.useTonemap), 1.0f);
}