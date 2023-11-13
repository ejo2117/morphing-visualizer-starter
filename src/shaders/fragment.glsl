varying vec2 vUv;
varying float vPattern;
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

    Color[3] colors = Color[](
        Color(vec3(0), 0.0),
        Color(vec3(0,1,0), 0.5),
        Color(vec3(1), 1.0)
    );

    COLOR_RAMP(colors, vPattern, color);

    gl_FragColor = vec4(color, 1);
}