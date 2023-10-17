#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) out vec4 color;

layout (binding = 0) uniform sampler2D colorTex;

layout (location = 0) in VS_OUT
{
  vec2 texCoord;
} surf;


// Билатеральный
//
void main()
{  
    const float color_coof = 0.01f;         // Коофиценты для нормирования расстояний между цветами
    const float len_coof = 0.1;             // и между расстояниями

    const int size = 3;                     // размер окна
    float t_size = textureSize(colorTex, 0).x;

    ivec2 centre = ivec2(surf.texCoord * 256.f);
    vec4 centre_c = texelFetch(colorTex, centre, 0);

    if (size == 1) {
        color = centre_c;
    }
    else {
        color = vec4(0);
        float all_w = 0;

        for (int x = 0; x < size*2 -1; x++) {
            for (int y = 0; y < size*2-1; y++) {
                ivec2 pos = centre + ivec2(x - size, y - size);
                if (pos.x < 0 || pos.y < 0 || pos.x >= t_size || pos.y >= t_size)
                    pos = centre;
                
                vec4 c = texelFetch(colorTex, pos, 0);
                float w = exp(pow(length(vec2(centre) - vec2(pos)) * len_coof, 3) + pow(length(c - centre_c) * color_coof, 3));

                color += c * w;
                all_w += w;
            }
        }
        
        color /= all_w;
      }
}


// Медиана
// В этом варианте main фильтр работает в координатах текстуры.
/*
void main()
{  
    const int size = 2;
    float t_size = 256.f;
    vec4 colors[(size*2-1)*(size*2-1)];

    ivec2 centre = ivec2(surf.texCoord * 256.f);

    if (size == 1) {
        color = textureLod(colorTex, surf.texCoord + vec2(0, 0), 0);
    }
    else {
        for (int x = 0; x < size*2 -1; x++) {
            for (int y = 0; y < size*2-1; y++) {
                ivec2 pos = centre + ivec2(x - size, y - size);
                if (pos.x < 0 || pos.y < 0 || pos.x >= t_size || pos.y >= t_size)
                    colors[x + (size*2-1) * y] = texelFetch(colorTex, centre, 0);
                else
                    colors[x + (size*2-1) * y] = texelFetch(colorTex, pos, 0);
            }
        }
        
        for (int i = 0; i < (size*2-1)*(size*2-1); i++) {
            int ind = i;
            for (int j = i; j < (size*2-1)*(size*2-1); j++) {
                if (max(colors[ind], colors[j]) == colors[j]) {
                    ind = j;
                }
            }
            vec4 swap = colors[ind];
            colors[ind] = colors[i];
            colors[i] = swap;
        }

        color = colors[(size*2-1)*(size*2-1)/2];
      }
}
*/

// Медиана
// Эта версия использует textureLod для сбора точек, деля на размер поля, что, вообщем-то говоря, наверное не очень хорошо,,,
/*
void main()
{  
    const int size = 2;
    float t_size = 256.f;
    vec4 colors[(size*2-1)*(size*2-1)];
    if (size == 1) {
        color = textureLod(colorTex, surf.texCoord + vec2(0, 0), 0);
    }
    
    else {
        for (int x = 0; x < size*2 -1; x++) {
            for (int y = 0; y < size*2-1; y++) {
                colors[x + (size*2-1) * y] = textureLod(colorTex, surf.texCoord + ivec2(float(x - size), float(y - size))/t_size, 0);
            }
        }
        
        for (int i = 0; i < (size*2-1)*(size*2-1); i++) {
            int ind = i;
            for (int j = i; j < (size*2-1)*(size*2-1); j++) {
                if (max(colors[ind], colors[j]) == colors[j]) {
                    ind = j;
                }
            }
            vec4 swap = colors[ind];
            colors[ind] = colors[i];
            colors[i] = swap;
        }

        color = colors[(size*2-1)*(size*2-1)/2];
      }
}
*/