varying vec2 vUv;
varying float vPattern;

uniform float uTime;
uniform float uAudioFrequency;

/* A struct made for the COLOR_RAMP macro */
struct Color{
    vec3 c;
    float position; // range -> [0, 1]
};

#define COLOR_RAMP(inputColors, inputPosition, finalColor) {\
    const int len = inputColors.length(); \
    int index = 0; \
    for(int i = 0; i < len - 1; i++){ \
        Color currentColor = inputColors[i]; \
        Color nextColor = inputColors[i + 1]; \
        bool pointExists = currentColor.position <= inputPosition && inputPosition <= nextColor.position; \
        index = pointExists ? i : index; \
    } \
    Color currentColor = inputColors[index]; \
    Color nextColor = inputColors[index + 1]; \
    vec3 c1 = currentColor.c; \
    vec3 c2 = nextColor.c; \
    float range = nextColor.position - currentColor.position; \
    float lerpFactor = (inputPosition - currentColor.position) / range; \
    finalColor = mix(c1, c2, lerpFactor); \
}\

void main() {
    vec3 color;
    float time = uTime * (1. + uAudioFrequency);

    vec3 mainColor = mix(vec3(0.2, 0.3, 0.9), vec3(0.4,1.0,0.3), uAudioFrequency);

    mainColor.r *= 0.9 + sin(time) / 3.2;    
    mainColor.g *= 1.1 + cos(time / 2.) / 2.5;    
    mainColor.b *= 0.8 + cos(time / 5.) / 4.0;    

    mainColor.rgb += 0.1;


    Color[4] colors = Color[](
        Color(vec3(1), 0.0),
        Color(vec3(1), 0.01),
        Color(mainColor, 0.1),
        Color(vec3(0.01,0.05,0.2), 1.0)
    );

    COLOR_RAMP(colors, vPattern, color);

    gl_FragColor = vec4(color, 1);
}