"use client";

import { Camera, Geometry, Mesh, Plane, Program, Renderer, Transform } from "ogl";
import { useEffect, useRef } from "react";

const BLADE_V = /* glsl */ `
attribute vec2 uv; attribute vec3 position;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

const BLADE_F = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime; uniform float uDim; uniform float uSeed; uniform float uHot; uniform vec3 uColor;
void main(){
  float edge = exp(-pow((vUv.y - 0.9) * 16.0, 2.0));
  float body = smoothstep(1.0, 0.0, abs(vUv.y - 0.5) * 2.0) * 0.10;
  float sweep = exp(-pow((vUv.x - fract(uTime * 0.11 + uSeed)) * 7.0, 2.0));
  float taper = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.72, vUv.x);
  float a = (edge * (0.45 + sweep * 1.5 + uHot) + body) * taper * uDim;
  gl_FragColor = vec4(uColor * a, a);
}`;

const DOT_V = /* glsl */ `
attribute vec3 position; attribute float random;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
uniform float uTime; uniform vec2 uMouse; uniform float uScale;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.25 + random * 6.283) * 0.18;
  p.x += cos(uTime * 0.18 + random * 9.0) * 0.1 - uMouse.x * 0.35;
  p.y += -uMouse.y * 0.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.5 + random * 3.0) * uScale / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const DOT_F = /* glsl */ `
precision highp float;
uniform float uDim;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * 0.55 * uDim;
  gl_FragColor = vec4(vec3(0.35, 0.9, 0.5) * a, a);
}`;

export default function HeroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    const hero = el?.closest<HTMLElement>(".hero");
    if (!el || !hero) return;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio, 1.5), webgl: 2 });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    el.appendChild(gl.canvas);
    gl.canvas.style.cssText = "width:100%;height:100%;display:block";

    const camera = new Camera(gl, { fov: 35, near: 0.1, far: 50 });
    camera.position.set(0, 0, 6);
    const scene = new Transform();

    const light = document.documentElement.dataset.theme === "light";
    const color = light ? [0.09, 0.47, 0.23] : [0.25, 0.8, 0.4];
    const lime = [0.78, 0.94, 0.19];

    // three light planes, same layout as the SVG blades
    const blades: { mesh: Mesh; base: number; u: Record<string, { value: number | number[] }> }[] = [];
    const rig = new Transform();
    rig.setParent(scene);
    [
      { x: -0.55, y: -0.5, s: 0.94, hot: 0, seed: 0.3, c: color, dim: 0.55 },
      { x: 0, y: 0, s: 1, hot: 0.9, seed: 0.0, c: lime, dim: 1 },
      { x: 0.55, y: 0.45, s: 0.88, hot: 0, seed: 0.62, c: color, dim: 0.55 },
    ].forEach((b) => {
      const uniforms = {
        uTime: { value: 0 },
        uDim: { value: b.dim },
        uSeed: { value: b.seed },
        uHot: { value: b.hot },
        uColor: { value: b.c },
      };
      const program = new Program(gl, {
        vertex: BLADE_V,
        fragment: BLADE_F,
        uniforms,
        transparent: true,
        depthTest: false,
        cullFace: null,
        ...({ blendFunc: { src: gl.ONE, dst: gl.ONE } } as object),
      });
      const mesh = new Mesh(gl, { geometry: new Plane(gl, { width: 1, height: 1 }), program });
      mesh.scale.set(7.5 * b.s, 0.5, 1);
      mesh.position.set(b.x, b.y, 0);
      mesh.rotation.z = 1.0;
      mesh.setParent(rig);
      blades.push({ mesh, base: 1.0, u: uniforms });
    });
    rig.position.set(1.9, -0.3, 0);

    // drifting particles
    const N = 260;
    const pos = new Float32Array(N * 3);
    const rnd = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      rnd[i] = Math.random();
    }
    const dotU = { uTime: { value: 0 }, uMouse: { value: [0, 0] }, uScale: { value: 260 * renderer.dpr }, uDim: { value: 1 } };
    const dots = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: new Geometry(gl, { position: { size: 3, data: pos }, random: { size: 1, data: rnd } }),
      program: new Program(gl, { vertex: DOT_V, fragment: DOT_F, uniforms: dotU, transparent: true, depthTest: false, ...({ blendFunc: { src: gl.ONE, dst: gl.ONE } } as object) }),
    });
    dots.setParent(scene);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = hero.clientWidth;
      h = hero.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    hero.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(hero);

    let raf = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const time = t / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const sp = parseFloat(hero.style.getPropertyValue("--sp") || "0");
      const dim = 1 - 0.7 * sp;
      camera.position.z = 6 + sp * 2.2;
      blades.forEach((b, i) => {
        b.mesh.rotation.z = b.base + -mouse.y * 0.05 * (i + 1) + mouse.x * 0.04;
        b.mesh.rotation.y = mouse.x * 0.18;
        b.u.uTime.value = time;
        b.u.uDim.value = (i === 1 ? 1 : 0.55) * dim;
      });
      dotU.uTime.value = time;
      dotU.uMouse.value = [mouse.x, mouse.y];
      dotU.uDim.value = dim;
      renderer.render({ scene, camera });
    };
    raf = requestAnimationFrame(loop);
    requestAnimationFrame(() => el.classList.add("ready"));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={host} className="hero-canvas" aria-hidden="true" />;
}
