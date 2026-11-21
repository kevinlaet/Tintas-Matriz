/* =====================================================================
   SOM OPCIONAL (desligado por padrão) — tudo sintetizado, sem arquivos
   - plop de tinta ao trocar de cor
   - ambiente leve e grave enquanto o som estiver ligado
   ===================================================================== */
let ctx = null, mestre = null, ambiente = null;
export const som = { ligado: false };

function garante() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ctx = new AC(); mestre = ctx.createGain(); mestre.gain.value = 0.0; mestre.connect(ctx.destination);
  return true;
}

export function ligaSom(on) {
  if (!garante()) return false;
  som.ligado = on;
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime;
  mestre.gain.cancelScheduledValues(t);
  mestre.gain.setTargetAtTime(on ? 0.9 : 0, t, 0.25);
  if (on && !ambiente) ambiente = criaAmbiente();
  return true;
}

function criaAmbiente() {
  const g = ctx.createGain(); g.gain.value = 0.045; g.connect(mestre);
  const filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 520; filtro.Q.value = 0.6; filtro.connect(g);
  const notas = [55, 82.41, 110, 164.81];
  notas.forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
    const og = ctx.createGain(); og.gain.value = 0.22 / (i + 1);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03; const lg = ctx.createGain(); lg.gain.value = 0.08 / (i + 1);
    lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(filtro); o.start(); lfo.start();
  });
  return g;
}

export function plop(intensidade = 1) {
  if (!som.ligado || !ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(420 * (0.9 + Math.random() * 0.25), t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.16);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35 * intensidade, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g); g.connect(mestre); o.start(t); o.stop(t + 0.25);
  // borbulha
  const n = ctx.createBufferSource(); const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
  n.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2;
  const ng = ctx.createGain(); ng.gain.value = 0.12 * intensidade; n.connect(f); f.connect(ng); ng.connect(mestre); n.start(t);
}

export function clique() {
  if (!som.ligado || !ctx) return;
  const t = ctx.currentTime; const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 880;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  o.connect(g); g.connect(mestre); o.start(t); o.stop(t + 0.07);
}
