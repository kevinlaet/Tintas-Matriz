/* Partículas luminosas (brasas) — vista de tela inteira no motor único */
import { THREE, motor, adicionaVista } from './motor.js';

export function criaParticulas() {
  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3000);
  camera.position.set(0, 0, 520);
  const fraco = (navigator.hardwareConcurrency || 8) <= 4;
  const area = (innerWidth * innerHeight) / (1920 * 1080);
  const N = Math.round(Math.min(2000, Math.max(500, 1500 * Math.sqrt(area))) * (fraco ? 0.55 : 1));
  const pos = new Float32Array(N * 3), sem = new Float32Array(N), tam = new Float32Array(N), cor = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 1800; pos[i * 3 + 1] = (Math.random() - 0.5) * 1400; pos[i * 3 + 2] = -900 + Math.random() * 1150;
    sem[i] = Math.random(); tam[i] = Math.pow(Math.random(), 2.2) * 2.6 + 0.6; cor[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSem', new THREE.BufferAttribute(sem, 1));
  geo.setAttribute('aTam', new THREE.BufferAttribute(tam, 1));
  geo.setAttribute('aCor', new THREE.BufferAttribute(cor, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uPix: { value: motor.dpr }, uRol: { value: 0 }, uAlt: { value: 1400 }, uForca: { value: 1 } },
    vertexShader: `uniform float uT,uPix,uRol,uAlt; attribute float aSem,aTam,aCor; varying float vCor,vBri;
      void main(){ vec3 p=position; float vel=6.0+aSem*22.0;
        p.y=mod(p.y+uT*vel+uRol*(0.10+aSem*0.25)+uAlt*0.5,uAlt)-uAlt*0.5;
        p.x+=sin(uT*0.25+aSem*40.0)*18.0;
        vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv;
        gl_PointSize=aTam*uPix*(420.0/-mv.z)*3.2; vCor=aCor; vBri=0.55+0.45*sin(uT*(0.8+aSem*2.0)+aSem*60.0); }`,
    fragmentShader: `uniform float uForca; varying float vCor,vBri;
      void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); a=a*a*vBri;
        vec3 la=vec3(0.969,0.651,0.0), me=vec3(0.933,0.416,0.039), ve=vec3(0.784,0.063,0.18);
        vec3 c=vCor<0.5?mix(la,me,vCor*2.0):mix(me,ve,(vCor-0.5)*2.0); if(vCor>0.965)c=vec3(1.0,0.93,0.82);
        gl_FragColor=vec4(c,a*0.8*uForca); }`,
  });
  cena.add(new THREE.Points(geo, mat));
  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const vista = adicionaVista({
    el: null, ordem: 0, limpa: false,
    desenha(dt, t, ret) {
      camera.aspect = ret.w / ret.h; camera.updateProjectionMatrix();
      if (!motor.reduz) mat.uniforms.uT.value = t;
      mat.uniforms.uRol.value = scrollY;
      camera.position.x += (mx * 70 - camera.position.x) * 0.035;
      camera.position.y += (-my * 50 - camera.position.y) * 0.035;
      camera.lookAt(0, 0, -200);
      motor.renderer.render(cena, camera);
    },
  });
  return { vista, mat };
}
