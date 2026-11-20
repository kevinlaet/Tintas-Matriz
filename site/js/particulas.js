/* Partículas luminosas (brasas laranja/vermelho) no fundo do site — Three.js */
import * as THREE from '../vendor/three.module.min.js';

export function iniciar(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3000);
  camera.position.set(0, 0, 520);

  const fraco = (navigator.hardwareConcurrency || 8) <= 4;
  const area = (innerWidth * innerHeight) / (1920 * 1080);
  const N = Math.round(Math.min(2400, Math.max(600, 1700 * Math.sqrt(area))) * (fraco ? 0.55 : 1));

  const pos = new Float32Array(N * 3), semente = new Float32Array(N), tam = new Float32Array(N), cor = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 1800;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1400;
    pos[i * 3 + 2] = -900 + Math.random() * 1150;
    semente[i] = Math.random();
    tam[i] = Math.pow(Math.random(), 2.2) * 2.6 + 0.6;
    cor[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSemente', new THREE.BufferAttribute(semente, 1));
  geo.setAttribute('aTam', new THREE.BufferAttribute(tam, 1));
  geo.setAttribute('aCor', new THREE.BufferAttribute(cor, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTempo: { value: 0 }, uPix: { value: dpr }, uRolagem: { value: 0 }, uAltura: { value: 1400 } },
    vertexShader: /* glsl */`
      uniform float uTempo, uPix, uRolagem, uAltura;
      attribute float aSemente, aTam, aCor;
      varying float vCor, vBrilho;
      void main(){
        vec3 p = position;
        float vel = 6.0 + aSemente * 22.0;
        p.y = mod(p.y + uTempo * vel + uRolagem * (0.10 + aSemente * 0.25) + uAltura * 0.5, uAltura) - uAltura * 0.5;
        p.x += sin(uTempo * 0.25 + aSemente * 40.0) * 18.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aTam * uPix * (420.0 / -mv.z) * 3.2;
        vCor = aCor;
        vBrilho = 0.55 + 0.45 * sin(uTempo * (0.8 + aSemente * 2.0) + aSemente * 60.0);
      }`,
    fragmentShader: /* glsl */`
      varying float vCor, vBrilho;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = a * a * vBrilho;
        vec3 laranja = vec3(0.969, 0.651, 0.0);
        vec3 meio = vec3(0.933, 0.416, 0.039);
        vec3 vermelho = vec3(0.784, 0.063, 0.180);
        vec3 c = vCor < 0.5 ? mix(laranja, meio, vCor * 2.0) : mix(meio, vermelho, (vCor - 0.5) * 2.0);
        if (vCor > 0.965) c = vec3(1.0, 0.93, 0.82);
        gl_FragColor = vec4(c, a * 0.85);
      }`,
  });
  const pontos = new THREE.Points(geo, mat);
  cena.add(pontos);

  // Anéis finos de luz ao fundo
  const aneis = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const r = 260 + i * 170;
    const g = new THREE.RingGeometry(r, r + 0.9, 160);
    const m = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xC8102E : 0xF7A600, transparent: true, opacity: 0.07 - i * 0.015, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const anel = new THREE.Mesh(g, m);
    anel.rotation.x = 1.25 + i * 0.08; anel.rotation.y = i * 0.3;
    anel.position.z = -500;
    aneis.add(anel);
  }
  cena.add(aneis);

  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  function ajusta() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', ajusta);
  ajusta();

  const relogio = new THREE.Clock();
  let rodando = true;
  document.addEventListener('visibilitychange', () => {
    rodando = !document.hidden;
    if (rodando) { relogio.getDelta(); requestAnimationFrame(loop); }
  });

  let t = 0;
  function loop() {
    if (!rodando) return;
    t += Math.min(relogio.getDelta(), 0.05);
    mat.uniforms.uTempo.value = t;
    mat.uniforms.uRolagem.value = scrollY;
    camera.position.x += (mx * 70 - camera.position.x) * 0.035;
    camera.position.y += (-my * 50 - camera.position.y) * 0.035;
    camera.lookAt(0, 0, -200);
    aneis.rotation.z = t * 0.03;
    aneis.children.forEach((a, i) => { a.rotation.z = t * (0.02 + i * 0.012) * (i % 2 ? -1 : 1); });
    renderer.render(cena, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
