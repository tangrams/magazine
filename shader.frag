#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texA;   // https://dl.dropboxusercontent.com/u/335522/mapzen/js.png
uniform sampler2D u_texB;   // https://dl.dropboxusercontent.com/u/335522/mapzen/es.png

uniform vec3 u_ui_color;
uniform vec3 u_diff_color;
uniform float u_pixel_density;
uniform float u_focus_zoom;
uniform float u_focus_area;
uniform float u_mode;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float pulse (float c, float w, float x ) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

float magnif(vec2 st, vec2 resolution, vec2 mouse) {
    st -= mouse;
    st.y *= resolution.y/resolution.x;
    return dot(st,st)*2.;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    
    float pixel_density = u_pixel_density;
    float mode = u_mode;
    float focus_zoom = u_focus_zoom;
    float focus_area = u_focus_area;
    float focus = u_focus_area;
    vec3 ui_color = u_ui_color;
    vec3 diff_color = u_diff_color;
    if (pixel_density == 0.) pixel_density = 2.;
    if (focus_zoom == 0.) focus_zoom = 2.;
    if (focus_area == 0.) focus_area = 0.01;
    if (ui_color == vec3(0.)) ui_color = vec3(0.200,0.478,0.718);
    if (diff_color == vec3(0.)) diff_color =  vec3(1.,0.,0.);
    // mode = 2.;
    
    // Fix pixel density 
    vec2 resolution = (u_resolution/pixel_density);
    vec2 mouse = u_mouse/resolution;
    mouse.y -= pixel_density-1.;

    // Zoom area
    vec2 st_zoom = st;
    st_zoom -= .5;
    float focus_point = magnif(st_zoom,resolution, mouse-.5);
    float focus_zone = step(focus_area,focus_point);
    st_zoom = mix(((st_zoom+mouse-.5)/focus_zoom),st_zoom,focus_zone);
    st_zoom += .5;
    
    vec3 color = vec3(0.);
    vec4 A = texture2D(u_texA, st_zoom);
    vec4 B = texture2D(u_texB, st_zoom);
    vec3 diff = abs(A-B).rgb;
    
    if (mode == 0.0) {
        // |
        color = mix(A.rgb,B.rgb,step(mouse.x,st.x));
    } else if (mode == 1.0){
        color += mix(vec3(max(diff.r,max(diff.g,diff.b))),
                     diff,
                     step(mouse.x,st.x));
    } else if (mode == 2.0){
        // +
        color = mix(mix(A.rgb,B.rgb,step(mouse.x,st.x)),
                    diff_color,
                    max(diff.r,max(diff.g,diff.b)));
    }
    
    color = mix(color, ui_color, pulse(mouse.x,(pixel_density/resolution.x),st.x)*focus_zone);
    color = mix(color, ui_color, pulse(focus_area,(pixel_density/resolution.x),focus_point));
    
    gl_FragColor = vec4(color,1.0);
}