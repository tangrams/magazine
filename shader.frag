#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texA;
uniform sampler2D u_texB;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 mouse = u_mouse/u_resolution;

    vec3 color = vec3(1.,0.,0.);
    vec4 A = texture2D(u_texA, st);
    vec4 B = texture2D(u_texB, st);
    
    // color = mix(A.rgb,B.rgb, abs(sin(u_time)));
    color = mix(A.rgb,B.rgb, step(mouse.x,st.x));
    
    gl_FragColor = vec4(color,1.0);
}