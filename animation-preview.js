const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const sectionProgress = (section) => {
  const rect = section.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  return clamp(-rect.top / travel);
};

const updatePreview = () => {
  const depth = document.querySelector(".depth-demo");
  const curtain = document.querySelector(".curtain-demo");
  const signature = document.querySelector(".signature-demo");

  if (depth) depth.style.setProperty("--depth", sectionProgress(depth).toFixed(4));
  if (curtain) curtain.style.setProperty("--curtain", sectionProgress(curtain).toFixed(4));
  if (signature) {
    const rect = signature.getBoundingClientRect();
    const progress = clamp((window.innerHeight * 0.78 - rect.top) / (window.innerHeight * 0.7));
    signature.style.setProperty("--signature", progress.toFixed(4));
  }
};

let frame = 0;
const requestUpdate = () => {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    updatePreview();
  });
};

addEventListener("scroll", requestUpdate, { passive: true });
addEventListener("resize", requestUpdate);
updatePreview();
