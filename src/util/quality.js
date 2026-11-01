// Resolution-only presets. FFT cascades, mesh and optical shading stay identical.
export const TIERS = { Low: 0.65, Medium: 0.85, High: 1, Ultra: 1.5 };

export function createQuality(renderer) {
  const settings = { tier: 'High', dynamic: true, targetFPS: 60 };
  const metrics = { cpuSimulationMs: 0, cpuGridMs: 0, cpuRenderSubmitMs: 0, wallMs: 16.7, scale: 1 };
  let scale = 1, elapsed = 0, frames = 0, sum = 0, fastWindows = 0, warmup = 5;
  const ceiling = () => TIERS[settings.tier];
  const floor = () => Math.min(0.5, ceiling());
  function apply(value) {
    scale = Math.max(floor(), Math.min(ceiling(), value));
    metrics.scale = scale;
    if (Math.abs(renderer.getPixelRatio() - scale) > 0.001) renderer.setPixelRatio(scale);
  }
  function reset() { elapsed = frames = sum = fastWindows = 0; warmup = 3; }
  function setTier(tier) {
    if (!(tier in TIERS)) return;
    settings.tier = tier;
    apply(ceiling()); reset();
  }
  function update(dt) {
    if (document.hidden || dt > 0.25) { reset(); return; }
    metrics.wallMs = metrics.wallMs * 0.9 + dt * 100;
    if (!settings.dynamic) { apply(ceiling()); reset(); return; }
    if (warmup > 0) { warmup -= dt; return; }
    elapsed += dt; sum += dt * 1000; frames++;
    if (elapsed < 2) return;
    const average = sum / frames, budget = 1000 / settings.targetFPS;
    // Hysteresis and bounded steps avoid reallocating buffers each frame.
    if (average > budget * 1.12) { apply(scale - 0.08); fastWindows = 0; }
    else if (average < budget * 1.03 && ++fastWindows >= 3) { apply(scale + 0.04); fastWindows = 0; }
    else if (average >= budget * 1.03) fastWindows = 0;
    elapsed = sum = frames = 0;
  }
  function cpu(name, value) { metrics[name] = metrics[name] * 0.9 + value * 0.1; }
  setTier(settings.tier);
  return { settings, metrics, setTier, update, cpu, reset };
}
