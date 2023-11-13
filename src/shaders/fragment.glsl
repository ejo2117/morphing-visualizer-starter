// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// Created by S.Guillitte
//Based on Voronoise by iq :https://www.shadertoy.com/view/Xd23Dh
//and Gabor 4: normalized  by FabriceNeyret2 : https://www.shadertoy.com/view/XlsGDs

varying vec2 vUv;
varying float vPattern;

void main() {
    gl_FragColor = vec4(vec3(vPattern), 1);
}