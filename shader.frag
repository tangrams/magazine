#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texA;   // Tangram.js
uniform sampler2D u_texB;   // Tangram-ES
uniform float u_mode;
uniform float u_area_size;

uniform float u_pixel_density;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float pulse (float c, float w, float x ) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec2 resolution = (u_resolution/u_pixel_density);
    vec2 mouse = u_mouse/resolution;
    mouse.y -= u_pixel_density-1.;

    vec3 color = vec3(0.);
    vec4 A = texture2D(u_texA, st);
    vec4 B = texture2D(u_texB, st);
    
    if (u_mode == 0.0) {
        // Side by side
        color = mix(A.rgb,B.rgb, step(mouse.x,st.x));
        color = mix(color,vec3(0.200,0.478,0.718),pulse(mouse.x,(1./resolution.x),st.x));
    } else if (u_mode == 1.0){
        //Area
        st -= mouse;
        st.y *= resolution.y/resolution.x;
        
        float pct = dot(st,st);
        float magSize = u_area_size;
        color = mix(B.rgb, A.rgb, step(magSize,pct));
        color = mix(color, vec3(0.200,0.478,0.718),pulse(magSize,1./(resolution.x),pct));
    } else if (u_mode == 2.0){
        // Ghost
        color = mix(A.rgb,B.rgb,abs(A-B).rgb);
    } else if (u_mode == 3.0){
        // Diff
        vec3 diff = abs(A-B).rgb;
        color += diff;
    } else if (u_mode == 4.0){
        // MaxDiff
        vec3 diff = abs(A-B).rgb;
        color += max(diff.r,max(diff.g,diff.b));
    } else if (u_mode == 5.0){
        // JS + diff
        vec3 diff = abs(A-B).rgb;
        color = mix(A.rgb,vec3(1.,0.0,0.0),max(diff.r,max(diff.g,diff.b)));
    } else if (u_mode == 6.0){
        // ES + diff
        vec3 diff = abs(A-B).rgb;
        color = mix(B.rgb,vec3(1.,0.0,0.0),max(diff.r,max(diff.g,diff.b)));
    } 
    
    gl_FragColor = vec4(color,1.0);
}